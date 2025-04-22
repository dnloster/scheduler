# Hệ thống xếp lịch học

Hệ thống quản lý và tự động xếp lịch học cho các khóa đào tạo, sử dụng MongoDB làm cơ sở dữ liệu.

## Cấu trúc dự án

```
scheduler/
├── backend/         # Backend API (Node.js, Express, MongoDB)
├── database/        # Script tạo cơ sở dữ liệu (cũ - MySQL)
└── frontend/        # Frontend UI (React)
```

## Yêu cầu hệ thống

-   Node.js (v14+)
-   MongoDB (v4.4+)
-   NPM hoặc Yarn

## Cài đặt và chạy hệ thống

### 1. Cài đặt MongoDB

Bạn cần cài đặt MongoDB trên máy tính của mình. Xem hướng dẫn tại [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/).

### 2. Cài đặt Backend

```bash
cd backend
npm install
```

#### Cấu hình môi trường

Tạo file `.env` trong thư mục `backend` với nội dung:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/scheduler_db
NODE_ENV=development
```

#### Khởi tạo dữ liệu mẫu

```bash
npm run seed
```

#### Chạy server

```bash
npm run dev
```

### 3. Cài đặt Frontend

```bash
cd frontend
npm install
```

#### Chạy frontend

```bash
npm start
```

Ứng dụng sẽ được chạy tại [http://localhost:3000](http://localhost:3000)

## Cấu trúc cơ sở dữ liệu

### Collections

1. **departments**: Quản lý thông tin chuyên ngành đào tạo
2. **classes**: Quản lý thông tin các lớp học
3. **courses**: Quản lý thông tin các môn học
4. **course_constraints**: Quản lý ràng buộc của các môn học
5. **special_events**: Quản lý các sự kiện đặc biệt
6. **schedules**: Quản lý lịch học

## API Endpoints

### Departments

-   `GET /api/departments`: Lấy tất cả chuyên ngành
-   `GET /api/departments/:id`: Lấy thông tin một chuyên ngành cụ thể
-   `POST /api/departments`: Tạo chuyên ngành mới
-   `PUT /api/departments/:id`: Cập nhật thông tin chuyên ngành
-   `DELETE /api/departments/:id`: Xóa chuyên ngành

### Classes

-   `GET /api/classes`: Lấy tất cả lớp học
-   `GET /api/classes/department/:departmentId`: Lấy lớp học theo chuyên ngành
-   `POST /api/classes`: Tạo lớp học mới
-   `PUT /api/classes/:id`: Cập nhật thông tin lớp học
-   `DELETE /api/classes/:id`: Xóa lớp học

### Courses

-   `GET /api/courses`: Lấy tất cả môn học
-   `GET /api/courses/:id`: Lấy thông tin một môn học cụ thể
-   `GET /api/courses/department/:departmentId`: Lấy môn học theo chuyên ngành
-   `POST /api/courses`: Tạo môn học mới
-   `PUT /api/courses/:id`: Cập nhật thông tin môn học
-   `DELETE /api/courses/:id`: Xóa môn học

### Course Constraints

-   `GET /api/constraints`: Lấy tất cả ràng buộc môn học
-   `GET /api/constraints/:id`: Lấy thông tin ràng buộc cụ thể
-   `GET /api/constraints/course/:courseId`: Lấy ràng buộc theo môn học
-   `POST /api/constraints`: Tạo ràng buộc môn học mới
-   `PUT /api/constraints/:id`: Cập nhật thông tin ràng buộc môn học

### Special Events

-   `GET /api/events`: Lấy tất cả sự kiện đặc biệt
-   `POST /api/events`: Tạo sự kiện đặc biệt mới

### Schedules

-   `GET /api/schedules`: Lấy tất cả lịch học
-   `POST /api/schedules`: Tạo lịch học mới
-   `POST /api/schedule/generate`: Tự động tạo lịch học dựa trên các ràng buộc
