# 🚀 Hướng dẫn Deploy lên GitHub Pages

## 📋 Tổng quan

Ứng dụng **Dự Kiến Điểm** được deploy tự động lên GitHub Pages sử dụng GitHub Actions. Mỗi khi có commit mới push lên branch `main`, ứng dụng sẽ được build và deploy tự động.

## ⚙️ Cấu hình GitHub Pages

### **Bước 1: Bật GitHub Pages**

1. Vào repository trên GitHub
2. Click tab **"Settings"**
3. Scroll xuống phần **"Pages"** (bên trái)
4. Trong **"Source"**, chọn **"GitHub Actions"**
5. Click **"Save"**

### **Bước 2: Kiểm tra Workflow**

File `.github/workflows/deploy.yml` đã được cấu hình sẵn với:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Pages
      uses: actions/configure-pages@v4
      
    - name: Upload artifact
      uses: actions/upload-pages-artifact@v3
      with:
        path: '.'
        
    - name: Deploy to GitHub Pages
      id: deployment
      uses: actions/deploy-pages@v4
```

### **Bước 3: Permissions**

Đảm bảo workflow có đủ quyền:
- `contents: read` - Đọc code
- `pages: write` - Ghi lên GitHub Pages  
- `id-token: write` - Xác thực

## 🔄 Quy trình Deploy

### **Tự động deploy:**
1. Developer push code lên branch `main`
2. GitHub Actions tự động trigger
3. Workflow checkout code
4. Setup GitHub Pages environment
5. Upload toàn bộ files
6. Deploy lên GitHub Pages
7. Ứng dụng live tại `https://username.github.io/DuKienDiem/`

### **Thời gian deploy:**
- **Build time**: ~1-2 phút
- **Deploy time**: ~30 giây
- **Total**: ~2-3 phút

## 📊 Monitoring

### **Kiểm tra trạng thái deploy:**

1. Vào tab **"Actions"** trong repository
2. Xem workflow **"Deploy to GitHub Pages"**
3. Trạng thái:
   - 🟢 **Green**: Deploy thành công
   - 🔴 **Red**: Deploy thất bại
   - 🟡 **Yellow**: Đang deploy

### **Xem logs chi tiết:**
1. Click vào workflow run
2. Click vào job **"deploy"**
3. Xem từng step để debug nếu có lỗi

## 🌐 URL và Domain

### **URL mặc định:**
```
https://tain03.github.io/DuKienDiem/
```

### **Custom domain (tùy chọn):**
1. Mua domain riêng
2. Tạo file `CNAME` trong root với nội dung domain
3. Cấu hình DNS records
4. Cập nhật trong Settings > Pages > Custom domain

## 🛠️ Troubleshooting

### **❌ Deploy thất bại:**

**Lỗi thường gặp:**

1. **"Permission denied"**
   - Kiểm tra permissions trong workflow
   - Đảm bảo GitHub Pages đã được bật

2. **"Build failed"**
   - Kiểm tra syntax HTML/CSS/JS
   - Xem logs chi tiết trong Actions

3. **"404 Not Found"**
   - Đảm bảo có file `index.html` trong root
   - Kiểm tra đường dẫn files

### **🔧 Debug steps:**

1. **Kiểm tra files:**
   ```bash
   # Đảm bảo có các files cần thiết
   index.html
   styles.css
   app.js
   Scores.json
   ```

2. **Test local:**
   ```bash
   # Mở file index.html bằng browser
   # Hoặc dùng live server
   python -m http.server 8000
   ```

3. **Kiểm tra console:**
   - Mở F12 > Console
   - Xem có lỗi JavaScript không

## 📱 Tối ưu cho Production

### **Performance:**
- Minify CSS/JS (tùy chọn)
- Optimize images
- Enable browser caching

### **SEO:**
- Thêm meta tags
- Sitemap.xml
- robots.txt

### **Analytics (tùy chọn):**
- Google Analytics
- GitHub Pages insights

## 🔄 Workflow nâng cao

### **Deploy staging:**
```yaml
# Deploy branch develop lên subdomain
on:
  push:
    branches: [ develop ]
```

### **Deploy với build process:**
```yaml
# Nếu cần build step (webpack, etc.)
- name: Build
  run: npm run build
  
- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: './dist'
```

## 📞 Hỗ trợ

### **Nếu gặp vấn đề:**
1. Kiểm tra [GitHub Pages documentation](https://docs.github.com/en/pages)
2. Xem [GitHub Actions logs](https://github.com/tain03/DuKienDiem/actions)
3. Tạo issue trong repository

### **Liên hệ:**
- GitHub: [@tain03](https://github.com/tain03)
- Email: Qua GitHub profile

---

**🎉 Chúc mừng! Ứng dụng của bạn đã live trên internet!**
