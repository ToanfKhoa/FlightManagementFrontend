import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { userService } from '../../services/userService';
import type { User, ApiResponse } from '../../types/authType';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (user: User) => void;
  initial?: Partial<User> | null;
  onUpdated?: (user: User) => void;
  mode?: 'create' | 'edit';
};

export default function UserFormDialog({ open, onOpenChange, onCreated, initial = null, onUpdated, mode = 'create' }: Props) {
  const [username, setUsername] = useState(initial?.username ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'PASSENGER'|'EMPLOYEE'|'ADMIN'>(initial?.role as any ?? 'PASSENGER');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      // reset to initial when opened
      setUsername(initial?.username ?? '');
      setEmail(initial?.email ?? '');
      setPhone(initial?.phone ?? '');
      setPassword('');
      setRole(initial?.role as any ?? 'PASSENGER');
    }
  }, [open, initial]);

  const handleSubmit = async () => {
    // For edit mode, password may be optional
    if (!username.trim() || !email.trim() || (mode === 'create' && !password.trim())) {
      toast.error('Username, email và password là bắt buộc (khi tạo mới)');
      return;
    }

    try {
      setSubmitting(true);
      const basePayload: any = { username: username.trim(), email: email.trim(), phone: phone.trim(), role };
      if (mode === 'create') basePayload.password = password.trim();

      if (mode === 'edit' && initial?.id != null) {
        const res = await userService.updateUser(String(initial.id), basePayload) as ApiResponse<User>;
        const ok = res && (res.code === 0 || res.code === 200 || String(res.message).toLowerCase().includes('success'));
        if (ok && res.data) {
          toast.success('Cập nhật tài khoản thành công');
          onUpdated?.(res.data);
          onOpenChange(false);
        } else {
          console.warn('Update user unexpected response:', res);
          toast.error('Cập nhật tài khoản thất bại');
        }
      } else {
        const payload = { ...basePayload, password: password.trim() };
        const res = await userService.createUser(payload as any) as ApiResponse<User>;
        const ok = res && (res.code === 0 || res.code === 200 || String(res.message).toLowerCase().includes('success'));
        if (ok && res.data) {
          toast.success('Tạo tài khoản thành công');
          onCreated?.(res.data);
          onOpenChange(false);
        } else {
          console.warn('Create user unexpected response:', res);
          toast.error('Tạo tài khoản thất bại');
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || (mode === 'create' ? 'Tạo tài khoản thất bại' : 'Cập nhật tài khoản thất bại'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Chỉnh sửa tài khoản' : 'Tạo tài khoản mới'}</DialogTitle>
          <DialogDescription>{mode === 'edit' ? 'Cập nhật thông tin tài khoản' : 'Nhập thông tin để tạo người dùng mới'}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <div>
            <label className="block text-sm text-gray-700">Username</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Phone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          {mode === 'create' && (
            <div>
              <label className="block text-sm text-gray-700">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-700">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as any)} className="mt-1 block w-full rounded-md border px-2 py-1">
              <option value="PASSENGER">PASSENGER</option>
              <option value="EMPLOYEE">EMPLOYEE</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div className="flex gap-2 justify-end mt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button disabled={submitting} onClick={handleSubmit}>Lưu</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
