# Tài liệu kỹ thuật: Sửa lỗi lịch thi V30/V31 và ngày khai giảng

Tài liệu này mô tả chi tiết các thay đổi đã được thực hiện để giải quyết các vấn đề sau:

1. Cập nhật quy trình xếp lịch thi V30/V31 với 5 giai đoạn
2. Đảm bảo ngày khai giảng 15/9 và 16/9 được xử lý đúng cách (thay vì 15/6)
3. Cải thiện hiển thị lịch thi trong giao diện người dùng

## Mô tả vấn đề

Hệ thống lập lịch đang gặp phải ba vấn đề chính:

1. **Lịch thi V30/V31 không hỗ trợ nhiều giai đoạn**: Khóa học V30 và V31 cần có 5 giai đoạn thi, nhưng hiện tại hệ thống chỉ hỗ trợ một kỳ thi duy nhất cho mỗi khóa học.

2. **Ngày khai giảng không đúng**: Ngày khai giảng được đặt sai thành 15/6/2025 thay vì 15-16/9/2025 đúng.

3. **Hiển thị lịch thi trên UI không đầy đủ**: Giao diện không hiển thị thông tin giai đoạn thi, gây khó khăn trong việc phân biệt giữa các giai đoạn thi.

## Các thay đổi đã thực hiện

### 1. Cập nhật quy trình xếp lịch thi V30/V31

-   Đã thêm trường `exam_phases` vào schema `CourseConstraint` để hỗ trợ nhiều giai đoạn thi
-   Đã cập nhật hàm `applyExamConstraints` trong `constraint-processor.js` để xử lý nhiều giai đoạn thi
-   Đã thêm các trường `exam_phase` và `total_phases` vào schema `Schedule` để lưu thông tin về giai đoạn thi
-   Đã cập nhật giao diện người dùng để hiển thị thông tin về giai đoạn thi (ví dụ: "1/5", "2/5", v.v.)

### 2. Đảm bảo ngày khai giảng 15/9 và 16/9

-   Đã sửa ngày khai giảng trong `seed.js` từ 15/6/2025 thành 15/9/2025
-   Đã tăng thời lượng sự kiện khai giảng từ 1 ngày lên 2 ngày để bao gồm cả 16/9

### 3. Giải quyết vấn đề hiển thị lịch thi

-   Đã cập nhật phương thức xử lý lịch thi trong `generateDepartmentSchedule` để lưu các lịch thi mới vào cơ sở dữ liệu
-   Đã cải thiện hiển thị lịch thi trong giao diện người dùng với viền đỏ và biểu tượng sao
-   Thêm tooltip hiển thị thông tin chi tiết về kỳ thi và giai đoạn

## Các công cụ hỗ trợ đã tạo

1. **create-exam-schedules.js**: Script tạo lịch thi V30/V31 với 5 giai đoạn
2. **check-exam-schedules.js**: Kiểm tra lịch thi V30/V31 và hiển thị trạng thái
3. **normalize-schedule-ids.js**: Chuẩn hóa các trường ID trong lịch thi
4. **apply-exam-fixes.sh**: Script chạy tất cả các công cụ theo thứ tự

### Chi tiết script

#### create-exam-schedules.js

Script này thực hiện:

-   Tìm khóa học V30 và V31
-   Cập nhật cấu hình thi với 5 giai đoạn
-   Xóa lịch thi cũ nếu có
-   Tạo lịch học cơ bản (nếu cần)
-   Tạo và lưu lịch thi mới với 5 giai đoạn cho mỗi lớp
-   Báo cáo kết quả chi tiết với các giai đoạn thi

#### check-exam-schedules.js

Script này kiểm tra:

-   Cấu hình thi V30/V31 đã được cập nhật
-   Lịch thi có đủ 5 giai đoạn cho mỗi lớp
-   Ngày khai giảng đã được sửa đúng thành 15-16/9

## Hướng dẫn áp dụng thay đổi

### Bước 1: Cập nhật cơ sở dữ liệu

```bash
# Di chuyển đến thư mục backend
cd backend

# Chạy script áp dụng thay đổi
bash apply-exam-fixes.sh
```

Script sẽ thực hiện 3 bước chính:

1. Tạo lịch thi V30/V31 với 5 giai đoạn
2. Chuẩn hóa các ID trong lịch thi
3. Kiểm tra lịch thi và ngày khai giảng

### Bước 2: Kiểm tra kết quả

Sau khi chạy script, kiểm tra kết quả từ terminal để đảm bảo:

1. Ngày khai giảng đã được cập nhật thành 15-16/9/2025
2. Cấu hình thi V30/V31 đã được cập nhật để hỗ trợ 5 giai đoạn
3. Mỗi lớp V30/V31 có đủ 5 lịch thi tương ứng với 5 giai đoạn

Kết quả thành công sẽ hiển thị:

```
✅ Đã tìm thấy: V30 (60...) và V31 (60...)
✅ Đã tạo 10 lịch thi (V30: 5, V31: 5)
✅ Chi tiết giai đoạn thi:
   V30: ✅ Đầy đủ (1,2,3,4,5)
   V31: ✅ Đầy đủ (1,2,3,4,5)
```

### Bước 3: Khởi động lại ứng dụng

```bash
# Khởi động lại server backend
cd backend
npm run dev

# Khởi động lại frontend (trong terminal mới)
cd frontend
npm start
```

### Bước 4: Xác minh trên giao diện

1. Truy cập giao diện lịch học
2. Kiểm tra xem lịch thi V30/V31 có hiển thị đúng với biểu tượng sao và số giai đoạn hay không
3. Kiểm tra xem ngày 15-16/9 có được đánh dấu là ngày khai giảng hay không

## Ghi chú bổ sung

-   Nếu các lịch thi không hiển thị, hãy kiểm tra console của trình duyệt xem có lỗi nào không
-   Có thể cần phải tạo lại dữ liệu mẫu bằng cách chạy `node seed.js` nếu cơ sở dữ liệu bị hỏng
-   Nếu gặp vấn đề về ID không khớp, hãy chạy `node normalize-schedule-ids.js` để sửa lỗi
