# Hướng dẫn triển khai các sửa lỗi lịch thi

Tài liệu này hướng dẫn cách áp dụng các sửa lỗi đã được triển khai trong hệ thống lập lịch cho kỳ thi V30/V31 và ngày khai giảng.

## Tóm tắt các thay đổi

1. **Lịch thi V30/V31 gồm 5 giai đoạn**

    - Đã thêm trường `exam_phases` vào schema CourseConstraint
    - Đã thêm trường `exam_phase` và `total_phases` vào schema Schedule
    - Đã cập nhật logic lên lịch thi với nhiều giai đoạn
    - Đã cải thiện hiển thị giai đoạn thi trên UI

2. **Ngày khai giảng sai (15/6 thay vì 15-16/9)**

    - Đã sửa ngày khai giảng từ 15/6/2025 thành 15/9/2025
    - Đã tăng thời lượng từ 1 ngày lên 2 ngày (15-16/9)

3. **Hiển thị lịch thi trên giao diện**
    - Đã cải thiện hiển thị với chỉ số giai đoạn (VD: "1/5")
    - Đã thêm tooltip cho các thông tin thi
    - Giữ nguyên giao diện hiện có với viền đỏ và biểu tượng sao

## Chi tiết kỹ thuật

1. **Thay đổi Model**

    - `CourseConstraint.js`: Thêm trường `exam_phases: { type: Number, default: 1 }`
    - `Schedule.js`: Thêm trường `exam_phase: Number` và `total_phases: Number`

2. **Thay đổi Logic**

    - `constraint-processor.js`: Cập nhật hàm `applyExamConstraints` để hỗ trợ nhiều giai đoạn thi
    - Thêm logic tính toán ngày thi với khoảng cách 2 ngày giữa các giai đoạn
    - Thêm ghi chú cho mỗi giai đoạn thi (VD: "Thi giai đoạn 1/5")

3. **Thay đổi UI**

    - `Schedule.js` (frontend): Thêm hiển thị giai đoạn thi `{schedule.exam_phase}/{schedule.total_phases}`
    - Duy trì viền đỏ và biểu tượng sao cho các kỳ thi

4. **Script Chẩn đoán và Sửa lỗi**
    - `create-exam-schedules.js`: Script tạo lịch thi mới cho V30/V31 với 5 giai đoạn
    - `check-exam-schedules.js`: Script kiểm tra lịch thi và ngày khai giảng
    - `normalize-schedule-ids.js`: Script chuẩn hóa ID trong lịch thi
    - `apply-exam-fixes.sh`: Script chạy tất cả các bước sửa lỗi

## Hướng dẫn triển khai

### Bước 1: Chạy script triển khai

Mở terminal trong thư mục backend và chạy script:

```bash
cd backend
bash apply-exam-fixes.sh
```

### Bước 2: Kiểm tra kết quả

Script sẽ thực hiện 3 công việc chính:

1. Tạo lịch thi cho V30/V31 với 5 giai đoạn
2. Chuẩn hóa các ID trong lịch thi
3. Kiểm tra lịch thi V30/V31

Kiểm tra kết quả trong terminal để đảm bảo:

-   Đã tạo đủ 5 giai đoạn thi cho mỗi lớp V30/V31
-   Ngày khai giảng đã được đặt đúng vào 15-16/9/2025

### Bước 3: Kiểm tra trên giao diện

Sau khi chạy script, thực hiện các bước kiểm tra:

1. Khởi động lại backend và frontend:

    ```bash
    cd backend
    npm run dev

    # Trong terminal khác
    cd frontend
    npm start
    ```

2. Truy cập giao diện và kiểm tra:
    - Lịch thi V30/V31 hiển thị đúng giai đoạn (1/5, 2/5, ...)
    - Ngày khai giảng hiển thị đúng 15-16/9/2025
    - Tooltip hiển thị đúng thông tin giai đoạn thi

## Xác nhận thành công

1. **Lịch thi V30/V31:**

    - Mỗi khóa học V30/V31 có đủ 5 giai đoạn thi
    - Mỗi giai đoạn cách nhau 2 ngày
    - Hiển thị số giai đoạn (1/5, 2/5, ...) trên UI

2. **Ngày khai giảng:**
    - Ngày khai giảng hiển thị đúng vào 15-16/9/2025
    - Thời lượng 2 ngày thay vì 1 ngày

## Xử lý sự cố

Nếu gặp lỗi trong quá trình triển khai:

1. **Cơ sở dữ liệu:**

    - Đảm bảo MongoDB đang chạy: `mongod --dbpath=../database`
    - Kiểm tra kết nối: `node -e "require('./database')(); console.log('Connected');"`

2. **Lỗi tạo lịch thi:**

    - Chạy riêng script: `node create-exam-schedules.js`
    - Kiểm tra log lỗi và debug theo hướng dẫn

3. **Lỗi hiển thị UI:**
    - Kiểm tra Console trong DevTools của trình duyệt
    - Kiểm tra API response trong Network tab

## Hỗ trợ và liên hệ

Nếu cần hỗ trợ thêm, vui lòng liên hệ với team phát triển qua email hoặc Slack.
