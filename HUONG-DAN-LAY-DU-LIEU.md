# 📊 Hướng dẫn lấy dữ liệu điểm từ hệ thống

## 🎯 Mục đích
Hướng dẫn này giúp bạn lấy dữ liệu điểm từ hệ thống quản lý học tập của trường để sử dụng với ứng dụng **Dự Kiến Điểm**.

## 🏫 Áp dụng cho
- **PTIT (Học viện Công nghệ Bưu chính Viễn thông)** - Hỗ trợ đầy đủ
- **Các trường khác** có hệ thống QLDT tương tự với cấu trúc JSON

> **Lưu ý**: Hướng dẫn này được viết dựa trên hệ thống QLDT của PTIT, nhưng có thể áp dụng cho các trường khác có cấu trúc tương tự.

## 📋 Các bước thực hiện

### **Bước 1: Truy cập vào giao diện xem điểm**

#### **Đối với sinh viên PTIT:**
1. Truy cập: https://qldt.ptit.edu.vn/
2. Đăng nhập bằng tài khoản sinh viên
3. Vào menu **"Kết quả học tập"** → **"Kết quả học tập"**
4. Chọn **"Tất cả"** để hiển thị điểm tất cả học kỳ

#### **Đối với sinh viên trường khác:**
1. Đăng nhập vào hệ thống quản lý học tập của trường
2. Điều hướng đến trang **"Kết quả học tập"** hoặc **"Bảng điểm"**
3. Đảm bảo trang đã load đầy đủ thông tin điểm

### **Bước 2: Mở Developer Tools**
1. Nhấn phím `F12` hoặc tổ hợp phím:
   - **Windows/Linux**: `Ctrl + Shift + I`
   - **Mac**: `Cmd + Option + I`
2. Cửa sổ Developer Tools sẽ mở ra
3. Click vào tab **"Network"** (Mạng)

### **Bước 3: Tìm request API**
1. **Làm mới trang** bằng cách nhấn `F5` hoặc `Ctrl + R`
2. Quan sát danh sách các request trong tab Network
3. Tìm request có đặc điểm sau:
   - **Method**: `GET` hoặc `POST`
   - **Type**: `XHR` hoặc `Fetch`
   - **Name** chứa từ khóa: `diem`, `score`, `grade`, `result`, `transcript`
   - **Status**: `200` (thành công)

![Ví dụ request cần tìm](screenshots/request.png)

**💡 Mẹo tìm request:**
- Sắp xếp theo **Size** (kích thước) - request chứa dữ liệu điểm thường có kích thước lớn
- Lọc theo **XHR/Fetch** để chỉ hiển thị API calls
- Tìm request có response chứa JSON data

### **Bước 4: Copy response data**
1. **Click** vào request đã tìm được
2. Chuyển sang tab **"Response"** ở panel bên phải
3. Bạn sẽ thấy dữ liệu JSON như trong ảnh dưới
4. **Click chuột phải** → **"Copy"** hoặc `Ctrl + A` → `Ctrl + C`
5. Mở **Notepad** hoặc text editor bất kỳ
6. **Paste** dữ liệu vào và lưu thành file `.txt`

![Ví dụ response data](screenshots/response.png)

### **Bước 5: Chuyển đổi định dạng file**
1. **Cách 1**: Đổi tên file
   - Click chuột phải vào file `.txt`
   - Chọn **"Rename"**
   - Đổi đuôi từ `.txt` thành `.json`
   
2. **Cách 2**: Tạo file mới
   - Tạo file mới với tên `my-scores.json`
   - Copy nội dung từ file `.txt` sang file `.json`

### **Bước 6: Import vào ứng dụng**
1. Mở ứng dụng **Dự Kiến Điểm**
2. Click nút **"📊 Import file điểm"**
3. Chọn file `.json` vừa tạo
4. Ứng dụng sẽ tự động:
   - Validate cấu trúc dữ liệu
   - Load và hiển thị điểm theo học kỳ
   - Tính toán GPA hiện tại

## 📚 Lấy dữ liệu chương trình đào tạo (CTĐT)

### 🎯 Mục đích
Để sử dụng tính năng **dự kiến điểm cho môn chưa học**, bạn cần import thêm dữ liệu chương trình đào tạo.

### 📋 Các bước thực hiện (Tương tự như lấy dữ liệu điểm)

#### **Bước 1: Truy cập trang chương trình đào tạo**

**Đối với sinh viên PTIT:**
1. Truy cập: https://qldt.ptit.edu.vn/
2. Đăng nhập bằng tài khoản sinh viên
3. Vào menu **"Chương trình đào tạo"** → **"Chương trình khung"**
4. Chọn chương trình đào tạo của bạn

#### **Bước 2-5: Thực hiện tương tự như lấy dữ liệu điểm**
1. **F12** → tab **Network**
2. **Refresh trang** hoặc thao tác load dữ liệu
3. **Tìm request** chứa từ khóa: `ctdt`, `curriculum`, `chuong-trinh`
4. **Copy response** và lưu thành file `.json`

#### **Bước 6: Import CTĐT vào ứng dụng**
1. Sau khi đã import file điểm, nút **"📚 Import CTĐT"** sẽ xuất hiện
2. Click nút **"📚 Import CTĐT"**
3. Chọn file CTĐT `.json` vừa tạo
4. Tab **"📚 Môn chưa học"** sẽ xuất hiện
5. Bây giờ có thể dự kiến điểm cho tất cả môn chưa học

## ⚠️ Lưu ý quan trọng

### **Bảo mật dữ liệu:**
- Dữ liệu điểm là thông tin cá nhân, không chia sẻ cho người khác
- Chỉ sử dụng trên máy tính cá nhân
- Xóa file sau khi sử dụng nếu cần thiết

### **Cấu trúc dữ liệu:**

#### **File điểm (Scores.json):**
```json
{
  "data": {
    "ds_diem_hocky": [
      {
        "hoc_ky": "20241",
        "ten_hoc_ky": "Học kỳ 1 - Năm học 2024-2025",
        "ds_diem_mon_hoc": [...]
      }
    ]
  }
}
```

#### **File CTĐT (ctdao.json):**
```json
{
  "data": {
    "ds_CTDT_hocky": [
      {
        "hoc_ky": "20241",
        "ten_hoc_ky": "Học kỳ 1 - Năm học 2024-2025",
        "ds_CTDT_mon_hoc": [
          {
            "ma_mon": "INT1313_CLC",
            "ten_mon": "Cơ sở dữ liệu",
            "so_tin_chi": "3",
            "mon_da_hoc": "x"  // "x" = đã học, "" = chưa học
          }
        ]
      }
    ]
  }
}
```

### **Xử lý lỗi thường gặp:**

**❌ "Cấu trúc dữ liệu không hợp lệ"**
- Kiểm tra file JSON có đúng format không
- Đảm bảo có trường `data.ds_diem_hocky`

**❌ "Không thể tìm thấy dữ liệu JSON"**
- Copy lại response từ đầu
- Kiểm tra đã copy đúng request chứa dữ liệu điểm

**❌ "File không đọc được"**
- Đảm bảo file có đuôi `.json`
- Kiểm tra encoding của file (nên là UTF-8)

**❌ "Cấu trúc dữ liệu CTĐT không hợp lệ"**
- Kiểm tra file có trường `data.ds_CTDT_hocky` không
- Đảm bảo đã copy đúng response từ trang chương trình đào tạo

**❌ "Không thấy tab Môn chưa học"**
- Phải import file điểm trước, sau đó mới import CTĐT
- Kiểm tra file CTĐT có dữ liệu môn chưa học không

## 🔧 Công cụ hỗ trợ

### **Validate JSON:**
- [JSONLint](https://jsonlint.com/) - Kiểm tra JSON hợp lệ
- [JSON Formatter](https://jsonformatter.curiousconcept.com/) - Format JSON đẹp

### **Text Editors khuyên dùng:**
- **VS Code** - Có syntax highlighting cho JSON
- **Notepad++** - Nhẹ và hỗ trợ nhiều format
- **Sublime Text** - Nhanh và mạnh mẽ

## 📞 Hỗ trợ

Nếu gặp khó khăn trong quá trình lấy dữ liệu:
1. Kiểm tra lại từng bước trong hướng dẫn
2. Thử với trình duyệt khác (Chrome, Firefox, Edge)
3. Liên hệ qua GitHub Issues để được hỗ trợ

---

**💡 Tip**: Sau khi lấy được dữ liệu lần đầu, bạn có thể sử dụng ứng dụng để dự kiến điểm cho các môn sắp thi mà không cần lấy dữ liệu lại!
