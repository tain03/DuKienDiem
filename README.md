# 📊 Dự Kiến Điểm - Grade Prediction Tool

Ứng dụng web đơn giản giúp sinh viên xem kết quả học tập và dự kiến điểm số để tính toán GPA tương lai.

## ✨ Tính năng chính

### 📋 Hiển thị kết quả học tập
- Xem điểm theo từng học kỳ với bảng chi tiết
- Hiển thị đầy đủ: STT, Mã MH, Nhóm/tổ, Tên môn học, Số tín chỉ, Điểm thi, Điểm TK (10), Điểm TK (4), Điểm TK (C), Kết quả, Chi tiết
- Thống kê điểm trung bình tích lũy và tổng tín chỉ đạt

### 🎯 Chức năng dự kiến điểm
- **Dự kiến điểm cho TẤT CẢ môn học** (kể cả môn chưa có điểm)
- Click vào cột "Điểm TK (10)" để nhập điểm dự kiến
- Tự động tính toán:
  - Điểm thang 4
  - Điểm chữ (A+, A, B+, B, C+, C, D+, D, F)
  - Kết quả đạt/không đạt
  - Điểm trung bình tích lũy mới

### 📁 Import file điểm
- Hỗ trợ file `.json` và `.js`
- Import file điểm từ máy tính
- Tự động validate cấu trúc dữ liệu

### 📊 Thang điểm chuẩn
| Thang 10 | Điểm chữ | Thang 4 | Kết quả |
|----------|----------|---------|---------|
| 9.0 - 10.0 | A+ | 4.0 | Đạt |
| 8.5 - 8.9 | A | 3.7 | Đạt |
| 8.0 - 8.4 | B+ | 3.5 | Đạt |
| 7.0 - 7.9 | B | 3.0 | Đạt |
| 6.5 - 6.9 | C+ | 2.5 | Đạt |
| 5.5 - 6.4 | C | 2.0 | Đạt |
| 5.0 - 5.4 | D+ | 1.5 | Đạt |
| 4.0 - 4.9 | D | 1.0 | Đạt |
| < 4.0 | F | 0.0 | Không đạt |

## 🚀 Cách sử dụng

### 1. Cài đặt
```bash
git clone https://github.com/tain03/DuKienDiem.git
cd DuKienDiem
```

### 2. Chạy ứng dụng
- Mở file `index.html` bằng trình duyệt web
- Hoặc sử dụng Live Server nếu có VS Code

### 3. Lấy dữ liệu điểm từ hệ thống

#### 📋 **Hướng dẫn chi tiết:**

**Bước 1:** Truy cập vào giao diện xem điểm của trường
- Đăng nhập vào hệ thống quản lý học tập
- Vào trang xem kết quả học tập/bảng điểm

**Bước 2:** Mở Developer Tools
- Nhấn phím `F12` hoặc `Ctrl + Shift + I`
- Chuyển sang tab **"Network"**

**Bước 3:** Tìm request API
- Refresh trang hoặc thực hiện thao tác load điểm
- Tìm request có tên tương tự như trong ảnh `request.png`
- Thường là request có chứa từ khóa: `diem`, `score`, `grade`, `result`

![Request Example](screenshots/request.png)

**Bước 4:** Copy response data
- Click vào request đã tìm được
- Chuyển sang tab **"Response"**
- Copy toàn bộ nội dung JSON như trong ảnh `response.png`
- Lưu vào file `.txt` trước

![Response Example](screenshots/response.png)

**Bước 5:** Chuyển đổi định dạng
- Đổi tên file từ `.txt` thành `.json`
- Hoặc tạo file mới với đuôi `.json`

**Bước 6:** Import vào ứng dụng
- Click nút "📁 Import file điểm"
- Chọn file `.json` vừa tạo
- Ứng dụng sẽ tự động load và hiển thị

> 📖 **[Xem hướng dẫn chi tiết với ảnh minh họa](HUONG-DAN-LAY-DU-LIEU.md)**

### 4. Dự kiến điểm
1. Bật "Chế độ dự kiến điểm"
2. Click vào ô điểm bất kỳ (cột "Điểm TK (10)")
3. Nhập điểm dự kiến (0-10)
4. Xem kết quả GPA mới ngay lập tức

## 📁 Cấu trúc dữ liệu

File điểm cần có cấu trúc JSON như sau:

```json
{
  "data": {
    "total_items": 52,
    "ds_diem_hocky": [
      {
        "hoc_ky": "20241",
        "ten_hoc_ky": "Học kỳ 1 - Năm học 2024 - 2025",
        "dtb_hk_he10": "6.79",
        "dtb_hk_he4": "2.49",
        "ds_diem_mon_hoc": [
          {
            "ma_mon": "INT1313_CLC",
            "ten_mon": "Cơ sở dữ liệu",
            "so_tin_chi": "3",
            "diem_tk": "6.7",
            "diem_tk_so": "2.5",
            "diem_tk_chu": "C+",
            "ket_qua": 1,
            "khong_tinh_diem_tbtl": 0
          }
        ]
      }
    ]
  }
}
```

## 🛠️ Công nghệ sử dụng

- **HTML5** - Cấu trúc trang web
- **CSS3** - Styling và responsive design
- **Vanilla JavaScript** - Logic xử lý và tương tác
- **JSON** - Lưu trữ dữ liệu điểm

## 📱 Responsive Design

- Tương thích với desktop, tablet và mobile
- Giao diện thân thiện, dễ sử dụng
- Dark/Light theme tự động theo hệ thống

## 🎨 Screenshots

![Main Interface](screenshots/main-interface.png)
*Giao diện chính hiển thị bảng điểm*

![Prediction Mode](screenshots/prediction-mode.png)
*Chế độ dự kiến điểm*

## 🤝 Đóng góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👨‍💻 Tác giả

**Nguyễn Đức Tài** - [@tain03](https://github.com/tain03)

## 🙏 Acknowledgments

- Cảm ơn các bạn sinh viên đã đóng góp ý kiến
- Inspired by academic management systems
- Built with ❤️ for Vietnamese students

---

⭐ **Nếu project hữu ích, hãy cho một star nhé!** ⭐
