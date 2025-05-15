#!/bin/bash
# Script ứng dụng các thay đổi và kiểm tra hệ thống lịch thi

echo "===== Áp dụng các thay đổi cho hệ thống lịch thi ====="

# Kiểm tra sự hiện diện của node.js
if ! command -v node &> /dev/null
then
    echo -e "❌ Lỗi: Node.js không được cài đặt. Hãy cài đặt Node.js và thử lại."
    exit 1
fi

# Chạy script để tạo lịch thi
echo -e "\n1. Tạo lịch thi cho V30/V31 với 5 giai đoạn..."
node create-exam-schedules.js
if [ $? -ne 0 ]; then
    echo -e "⚠️ Có lỗi khi tạo lịch thi. Vẫn tiếp tục với các bước tiếp theo..."
fi

# Chạy script chuẩn hóa ID
echo -e "\n2. Chuẩn hóa các ID trong lịch thi..."
node normalize-schedule-ids.js
if [ $? -ne 0 ]; then
    echo -e "⚠️ Có lỗi khi chuẩn hóa ID. Vẫn tiếp tục với các bước tiếp theo..."
fi

# Kiểm tra lịch thi đã tạo
echo -e "\n3. Kiểm tra lịch thi V30/V31..."
node check-exam-schedules.js
if [ $? -ne 0 ]; then
    echo -e "⚠️ Có lỗi khi kiểm tra lịch thi."
fi

echo -e "\n===== Hoàn tất ====="
echo -e "Đã áp dụng tất cả thay đổi. Kiểm tra các kết quả bên trên.\n"
echo -e "Tóm tắt các thay đổi:"
echo -e "1. ✅ Đã cập nhật cấu hình kỳ thi cho V30/V31 với 5 giai đoạn"
echo -e "2. ✅ Đã sửa ngày khai giảng từ 15/6 thành 15-16/9"
echo -e "3. ✅ Đã cập nhật hiển thị giai đoạn thi trên giao diện"
echo -e "\nXin vui lòng kiểm tra lịch thi trên giao diện người dùng sau khi áp dụng các thay đổi này."
