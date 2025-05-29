import introJs from 'intro.js';
import 'intro.js/introjs.css';

class IntroService {
    constructor() {
        this.intro = introJs();
        this.setupDefaultOptions();
    }

    setupDefaultOptions() {
        this.intro.setOptions({
            nextLabel: 'Tiếp theo →',
            prevLabel: '← Quay lại',
            skipLabel: 'Bỏ qua',
            doneLabel: 'Hoàn thành',
            showProgress: true,
            showBullets: false,
            exitOnOverlayClick: false,
            exitOnEsc: true,
            keyboardNavigation: true,
            disableInteraction: false,
            highlightClass: 'introjs-highlight',
            hintButtonLabel: 'OK',
        });
    }

    // Main dashboard tour
    startDashboardTour() {
        const steps = [
            {
                intro: `
                    <div style="text-align: center;">
                        <h3>🎉 Chào mừng đến với Hệ thống Xếp lịch!</h3>
                        <p>Chúng tôi sẽ hướng dẫn bạn sử dụng các tính năng chính của hệ thống.</p>
                        <img src="/TCDKTTT.png" alt="Logo" style="width: 80px; margin: 10px 0;" />
                    </div>
                `
            },
            {
                element: '[data-intro="navigation"]',
                intro: `
                    <h4>📋 Thanh điều hướng</h4>
                    <p>Đây là thanh điều hướng chính của hệ thống. Bạn có thể truy cập tất cả các chức năng từ đây:</p>
                    <ul style="text-align: left; margin: 10px 0;">
                        <li><strong>Dashboard:</strong> Tổng quan hệ thống</li>
                        <li><strong>Khoa/Phòng ban:</strong> Quản lý đơn vị</li>
                        <li><strong>Môn học:</strong> Quản lý môn học với cấu hình chi tiết</li>
                        <li><strong>Lớp học:</strong> Quản lý lớp học</li>
                        <li><strong>Lịch học:</strong> Xem và tạo lịch học</li>
                    </ul>
                `
            },
            {
                element: '[data-intro="dashboard-stats"]',
                intro: `
                    <h4>📊 Thống kê tổng quan</h4>
                    <p>Khu vực này hiển thị các thống kê quan trọng:</p>
                    <ul style="text-align: left;">
                        <li>Tổng số khoa/phòng ban</li>
                        <li>Tổng số môn học</li>
                        <li>Tổng số lớp học</li>
                        <li>Số lịch học đã tạo</li>
                    </ul>
                `
            },
            {
                element: '[data-intro="recent-activity"]',
                intro: `
                    <h4>🕒 Hoạt động gần đây</h4>
                    <p>Theo dõi các hoạt động và thay đổi mới nhất trong hệ thống.</p>
                `
            }
        ];

        this.intro.setOptions({
            steps: steps
        });

        return this.intro.start();
    }

    // Course management tour
    startCourseTour() {
        const steps = [
            {
                intro: `
                    <div style="text-align: center;">
                        <h3>📚 Quản lý Môn học</h3>
                        <p>Hướng dẫn quản lý môn học và cấu hình chi tiết.</p>
                    </div>
                `
            },
            {
                element: '[data-intro="course-list"]',
                intro: `
                    <h4>📋 Danh sách môn học</h4>
                    <p>Xem tất cả môn học trong hệ thống với thông tin cơ bản như mã môn, tên môn, khoa, và số tiết.</p>
                `
            },
            {
                element: '[data-intro="add-course-btn"]',
                intro: `
                    <h4>➕ Thêm môn học mới</h4>
                    <p>Nhấn nút này để thêm môn học mới với giao diện tab được cải tiến.</p>
                `
            },
            {
                element: '[data-intro="course-tabs"]',
                intro: `
                    <h4>📑 Giao diện Tab mới</h4>
                    <p>Giao diện đã được cải tiến với 2 tab chính:</p>
                    <ul style="text-align: left;">
                        <li><strong>Tab 1:</strong> Thông tin cơ bản (mã môn, tên, khoa, số tiết)</li>
                        <li><strong>Tab 2:</strong> Cấu hình chi tiết (ghép lớp, lý thuyết/thực hành, lịch thi)</li>
                    </ul>
                `
            },
            {
                element: '[data-intro="course-config"]',
                intro: `
                    <h4>⚙️ Cấu hình chi tiết</h4>
                    <p>Tab cấu hình chi tiết bao gồm:</p>
                    <ul style="text-align: left;">
                        <li>Giới hạn thời gian học</li>
                        <li>Cấu hình ghép lớp</li>
                        <li>Phân chia lý thuyết/thực hành</li>
                        <li>Lịch kiểm tra và thi</li>
                        <li>Yêu cầu đặc biệt (V30/V31)</li>
                    </ul>
                `
            }
        ];

        this.intro.setOptions({
            steps: steps
        });

        return this.intro.start();
    }

    // Schedule generation tour
    startScheduleTour() {
        const steps = [
            {
                intro: `
                    <div style="text-align: center;">
                        <h3>📅 Tạo lịch học</h3>
                        <p>Hướng dẫn quy trình tạo lịch học tự động.</p>
                    </div>
                `
            },
            {
                element: '[data-intro="schedule-steps"]',
                intro: `
                    <h4>📝 Quy trình 5 bước</h4>
                    <p>Hệ thống sẽ dẫn bạn qua 5 bước để tạo lịch học:</p>
                    <ol style="text-align: left;">
                        <li>Chọn khoa và thời gian</li>
                        <li>Cấu hình sự kiện đặc biệt</li>
                        <li>Cấu hình kiểm tra và thi (đã được đơn giản hóa)</li>
                        <li>Thiết lập ràng buộc</li>
                        <li>Xem tóm tắt và tạo lịch</li>
                    </ol>
                `
            },
            {
                element: '[data-intro="schedule-config"]',
                intro: `
                    <h4>⚙️ Cấu hình đã được cải tiến</h4>
                    <p>Bước 3 đã được đơn giản hóa, chỉ tập trung vào:</p>
                    <ul style="text-align: left;">
                        <li>Cấu hình lịch thi cơ bản</li>
                        <li>Kiểm tra định kỳ</li>
                        <li>Tùy chọn thời gian toàn cục</li>
                    </ul>
                    <p><strong>Lưu ý:</strong> Cấu hình chi tiết cho từng môn học được thực hiện trong phần Quản lý môn học.</p>
                `
            }
        ];

        this.intro.setOptions({
            steps: steps
        });

        return this.intro.start();
    }

    // Quick feature highlights
    startQuickTour() {
        const steps = [
            {
                intro: `
                    <div style="text-align: center;">
                        <h3>🚀 Tính năng nổi bật</h3>
                        <p>Khám phá các tính năng mới được cải tiến!</p>
                    </div>
                `
            },
            {
                element: '[data-intro="navigation"]',
                intro: `
                    <h4>🎯 Phân tách rõ ràng</h4>
                    <p>Hệ thống đã được tối ưu hóa:</p>
                    <ul style="text-align: left;">
                        <li><strong>Quản lý môn học:</strong> Cấu hình chi tiết từng môn</li>
                        <li><strong>Tạo lịch học:</strong> Cấu hình chung cho toàn hệ thống</li>
                        <li><strong>Giao diện Tab:</strong> Dễ sử dụng và có tổ chức</li>
                    </ul>
                `
            },
            {
                intro: `
                    <div style="text-align: center;">
                        <h3>✨ Sẵn sàng bắt đầu!</h3>
                        <p>Bạn đã sẵn sàng sử dụng hệ thống. Chúc bạn làm việc hiệu quả!</p>
                        <p><small>💡 Bạn có thể xem lại hướng dẫn bất kỳ lúc nào từ menu trợ giúp.</small></p>
                    </div>
                `
            }
        ];

        this.intro.setOptions({
            steps: steps
        });

        return this.intro.start();
    }

    // Custom tour with provided steps
    startCustomTour(steps) {
        this.intro.setOptions({
            steps: steps
        });

        return this.intro.start();
    }

    // Exit tour
    exit() {
        this.intro.exit();
    }

    // Add callbacks
    onComplete(callback) {
        this.intro.oncomplete(callback);
        return this;
    }

    onExit(callback) {
        this.intro.onexit(callback);
        return this;
    }

    onChange(callback) {
        this.intro.onchange(callback);
        return this;
    }
}

// Create singleton instance
const introService = new IntroService();

export default introService;
