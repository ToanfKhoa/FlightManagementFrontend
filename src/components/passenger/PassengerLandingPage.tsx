import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import {
    Plane,
    Search,
    Shield,
    Clock,
    MapPin,
    Star,
    Users
} from "lucide-react";

const backgroundImage = new URL("../../assets/images/airplane-wallpaper.jpg", import.meta.url).href;

interface PassengerLandingPageProps {
    onLogin: () => void;
    onRegister: () => void;
}

export function PassengerLandingPage({ onLogin, onRegister }: PassengerLandingPageProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <Plane className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">SkyWings Airlines</h1>
                            <p className="text-sm text-gray-600">Bay cao, bay xa cùng chúng tôi</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onLogin}>
                            Đăng nhập
                        </Button>
                        <Button onClick={onRegister}>
                            Đăng ký
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section
                className="relative min-h-screen px-4 flex items-center justify-center bg-fixed"
                style={{
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed'
                }}
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50"></div>

                {/* Content */}
                <div className="relative max-w-4xl mx-auto text-center pt-24">

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-8 leading-tight">
                        Khám phá thế giới cùng <br></br>
                        <span className="text-black">
                            SkyWings
                        </span>
                    </h1>

                    <p className="text-2xl text-white mb-12 max-w-3xl mx-auto drop-shadow">
                        Trải nghiệm dịch vụ hàng không hiện đại với đội ngũ chuyên nghiệp,
                        mạng lưới đường bay rộng khắp và dịch vụ khách hàng tận tâm.
                    </p>

                    <div className="flex justify-center gap-4 flex-wrap mt-10">
                        <Button variant="ghost" size="lg" onClick={onRegister}
                            className="px-10 py-4 text-lg text-white">
                            <Search className="w-5 h-5 mr-2" />
                            Đăng ký miễn phí
                        </Button>


                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Tại sao chọn SkyWings?
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Chúng tôi cam kết mang đến trải nghiệm bay tốt nhất cho mọi hành khách
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="text-center hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-4">
                                    <Shield className="w-6 h-6 text-blue-600" />
                                </div>
                                <CardTitle className="text-lg">An toàn tuyệt đối</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    Đội bay hiện đại, phi công giàu kinh nghiệm và quy trình an toàn nghiêm ngặt
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card className="text-center hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
                                    <Clock className="w-6 h-6 text-green-600" />
                                </div>
                                <CardTitle className="text-lg">Đúng giờ</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    Tỷ lệ đúng giờ cao, hệ thống quản lý chuyến bay hiện đại
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card className="text-center hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="mx-auto bg-purple-100 p-3 rounded-full w-fit mb-4">
                                    <MapPin className="w-6 h-6 text-purple-600" />
                                </div>
                                <CardTitle className="text-lg">Mạng lưới rộng</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    Bay đến hơn 50 thành phố trong nước và quốc tế
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card className="text-center hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="mx-auto bg-orange-100 p-3 rounded-full w-fit mb-4">
                                    <Users className="w-6 h-6 text-orange-600" />
                                </div>
                                <CardTitle className="text-lg">Dịch vụ tận tâm</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    Đội ngũ nhân viên chuyên nghiệp, luôn sẵn sàng hỗ trợ quý khách
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 px-4 bg-blue-600 text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-3xl font-bold mb-2">50+</div>
                            <div className="text-blue-100">Điểm đến</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold mb-2">100+</div>
                            <div className="text-blue-100">Chuyến bay/ngày</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold mb-2">95%</div>
                            <div className="text-blue-100">Tỷ lệ đúng giờ</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold mb-2">1M+</div>
                            <div className="text-blue-100">Hành khách/năm</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-16 px-4 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Khách hàng nói gì về chúng tôi
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-4">
                                    "Dịch vụ tuyệt vời! Máy bay sạch sẽ, phi hành đoàn thân thiện.
                                    Tôi sẽ tiếp tục chọn SkyWings cho những chuyến đi tiếp theo."
                                </p>
                                <div className="font-semibold">Nguyễn Văn A</div>
                                <div className="text-sm text-gray-500">Hà Nội</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-4">
                                    "Quy trình check-in nhanh chóng, giá vé hợp lý.
                                    Rất tiện lợi để theo dõi chuyến bay."
                                </p>
                                <div className="font-semibold">Trần Thị B</div>
                                <div className="text-sm text-gray-500">TP.HCM</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-4">
                                    "Bay cùng SkyWings luôn an tâm. Chỗ ngồi thoải mái và các dịch vụ trên máy bay đều vô cùng hài lòng."
                                </p>
                                <div className="font-semibold">Lê Văn C</div>
                                <div className="text-sm text-gray-500">Đà Nẵng</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 bg-blue-600 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        Sẵn sàng cho chuyến đi tiếp theo?
                    </h2>
                    <p className="text-xl mb-8 text-blue-100">
                        Đặt vé ngay để tận hưởng một trải nghiệm hoàn toàn khác biệt
                    </p>
                    <div className="flex justify-center gap-4">

                    </div>
                </div>
            </section>

            {/* Footer 
            <footer className="bg-gray-900 text-white py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-blue-600 p-2 rounded-lg">
                                    <Plane className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold text-lg">SkyWings Airlines</span>
                            </div>

                            <div className="flex gap-4">
                                <Facebook className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                                <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                                <Instagram className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                            </div>
                        </div>



                        <div>
                            <h3 className="font-semibold mb-4">Hỗ trợ</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white">Trung tâm trợ giúp</a></li>
                                <li><a href="#" className="hover:text-white">Liên hệ chúng tôi</a></li>
                                <li><a href="#" className="hover:text-white">Chính sách hoàn tiền</a></li>
                                <li><a href="#" className="hover:text-white">Điều khoản sử dụng</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Liên hệ</h3>
                            <div className="space-y-2 text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    <span>1900 XXX XXX</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    <span>support@skywings.vn</span>
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm">
                                        123 Đường ABC, Quận XYZ<br />
                                        TP.HCM, Việt Nam
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 SkyWings Airlines. Tất cả quyền được bảo lưu.</p>
                    </div>
                </div>
            </footer>   */}
        </div>

    );
}