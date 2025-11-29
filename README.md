# P2P Chat DApp - Frontend

Ứng dụng chat phi tập trung trên Ethereum blockchain với giao diện React hiện đại.

![React](https://img.shields.io/badge/React-18.3.1-blue)
![Web3.js](https://img.shields.io/badge/Web3.js-4.13.0-green)
![Vite](https://img.shields.io/badge/Vite-6.0.1-purple)

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Tính năng](#tính-năng)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt](#cài-đặt)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
- [Xử lý lỗi](#xử-lý-lỗi)

## 🚀 Giới thiệu

P2P Chat DApp là ứng dụng nhắn tin phi tập trung cho phép người dùng trò chuyện trực tiếp trên blockchain Ethereum. Tất cả tin nhắn được lưu trữ on-chain, đảm bảo tính minh bạch và bất biến.

**Smart Contract đã được deploy sẵn trên Sepolia Testnet**, bạn chỉ cần chạy frontend để sử dụng.

## ✨ Tính năng

- 🔐 **Kết nối ví** - Hỗ trợ MetaMask và các ví Web3
- 💬 **Gửi tin nhắn** - Nhắn tin với bất kỳ địa chỉ Ethereum nào
- ✏️ **Chỉnh sửa tin nhắn** - Sửa tin nhắn đã gửi
- 🗑️ **Xóa tin nhắn** - Xóa tin nhắn của bạn
- 📋 **Copy địa chỉ** - Sao chép địa chỉ ví dễ dàng
- 🔄 **Tự động cập nhật** - Tin nhắn cập nhật mỗi 5 giây
- 📱 **Responsive** - Hoạt động trên desktop và mobile
- 🎨 **UI hiện đại** - Giao diện đẹp mắt, dễ sử dụng

## 📦 Yêu cầu hệ thống

Đảm bảo bạn đã cài đặt:

- **Node.js** v18 hoặc v20 - [Tải về](https://nodejs.org/)
- **MetaMask Extension** - [Cài đặt](https://metamask.io/)
- **Sepolia ETH** - Lấy miễn phí từ [Sepolia Faucet](https://sepoliafaucet.com/)

### Kiểm tra phiên bản

node --version # v18.x hoặc v20.x
npm --version # 9.x trở lên

## 🔧 Cài đặt

### Bước 1: Clone hoặc tải project

Clone từ GitHub
git clone https://github.com/phillong97254/ChatDapp.git
cd Front-end ChatDapp

Hoặc giải nén file zip đã tải
cd Front-end ChatDapp
### Bước 2: Cài đặt dependencies

npm install
**Lưu ý**: Quá trình cài đặt có thể mất 2-5 phút tùy theo tốc độ mạng.

## 🚀 Chạy ứng dụng

### Chạy Development Server

npm run dev
### Truy cập ứng dụng

Mở trình duyệt và truy cập:

http://localhost:5173

Bạn sẽ thấy giao diện chính của ứng dụng!

### Dừng server

Nhấn `Ctrl + C` trong terminal để dừng server.

## 📖 Hướng dẫn sử dụng

### 1. Chuẩn bị

**Cài đặt MetaMask:**
1. Cài extension MetaMask từ [metamask.io](https://metamask.io/)
2. Tạo hoặc import ví
3. Chuyển sang mạng **Sepolia Testnet**

**Lấy Sepolia ETH:**
1. Truy cập [Sepolia Faucet](https://sepoliafaucet.com/)
2. Nhập địa chỉ ví của bạn
3. Nhận 0.5 SepoliaETH miễn phí

### 2. Kết nối ví

1. Click nút **"Connect Wallet"** ở góc phải trên
2. MetaMask sẽ bật lên, chọn tài khoản
3. Click **"Next"** → **"Connect"**
4. Địa chỉ ví của bạn sẽ hiển thị

### 3. Bắt đầu chat

**Tạo chat mới:**
1. Nhập địa chỉ Ethereum vào ô **"0x..."**
2. Click **"Start Chat"**
3. Chat room tự động tạo

**Gửi tin nhắn:**
1. Chọn chat từ danh sách bên trái
2. Nhập tin nhắn vào ô input
3. Click **"Send"**
4. Xác nhận transaction trên MetaMask
5. Đợi vài giây để tin nhắn xuất hiện

### 4. Chỉnh sửa tin nhắn

1. Click vào tin nhắn bạn đã gửi
2. Menu **Edit/Delete** hiện ra
3. Click **✏️ Edit**
4. Sửa nội dung
5. Click **Save** → Xác nhận transaction

### 5. Xóa tin nhắn

1. Click vào tin nhắn của bạn
2. Click **🗑️ Delete**
3. Xác nhận → Xác nhận transaction

### 6. Ngắt kết nối

1. Click vào địa chỉ ví (góc phải trên)
2. Click **🔌 Disconnect**
3. Quay về trang chủ
## 💡 Mẹo sử dụng

### Tiết kiệm Gas Fee

- Gửi nhiều tin nhắn cùng lúc nếu được
- Sử dụng vào giờ ít người (2-6 AM UTC)
- Không spam edit/delete nhiều lần

### Bảo mật

- ⚠️ **KHÔNG BAO GIỜ** chia sẻ private key
- ✅ Kiểm tra kỹ địa chỉ người nhận
- ✅ Đọc kỹ transaction trước khi xác nhận
- ✅ Chỉ dùng ví test cho testnet

### Trải nghiệm tốt hơn

- Dùng Chrome hoặc Brave để tương thích tốt nhất
- Không reload trang khi đang gửi tin nhắn
- Chờ transaction confirm trước khi gửi tin mới

## 🔗 Thông tin Smart Contract

- **Địa chỉ:** `0xfEAC9d44d5fD549a0CcA2D9c0bC2c9A20a742E9e`
- **Mạng:** Sepolia Testnet
- **Chain ID:** 11155111
- **Explorer:** [Xem trên Etherscan](https://sepolia.etherscan.io/address/0xfEAC9d44d5fD549a0CcA2D9c0bC2c9A20a742E9e)

## 🧪 Test ứng dụng

### Checklist kiểm tra

- [ ] Kết nối MetaMask thành công
- [ ] Tạo chat mới với địa chỉ hợp lệ
- [ ] Gửi tin nhắn (cần confirm transaction)
- [ ] Nhận và hiển thị tin nhắn
- [ ] Chỉnh sửa tin nhắn của mình
- [ ] Xóa tin nhắn của mình
- [ ] Copy địa chỉ ví
- [ ] Disconnect về trang chủ
- [ ] Messages tự động refresh
- [ ] Giao diện responsive trên mobile

### Test với 2 tài khoản

1. Mở ứng dụng trên trình duyệt thứ nhất
2. Connect với Account 1
3. Mở ứng dụng trên trình duyệt thứ hai (hoặc Incognito)
4. Connect với Account 2
5. Account 1 tạo chat với địa chỉ Account 2
6. Gửi tin nhắn qua lại
7. Kiểm tra cả 2 bên đều thấy tin nhắn

## 🐛 Báo lỗi

Nếu gặp lỗi, vui lòng cung cấp:

1. Mô tả lỗi chi tiết
2. Các bước tái hiện
3. Screenshots (nếu có)
4. Thông tin:
   - Hệ điều hành
   - Trình duyệt
   - Node version
   - Thông báo lỗi trong Console (F12)

## 📞 Liên hệ

- Email: phillong97254@gmail.com
- GitHub: https://github.com/phillong97254

---

**Chúc bạn sử dụng vui vẻ! 🎉**

**Lưu ý:** Đây là ứng dụng demo trên testnet. Không sử dụng với số tiền thật trên mainnet.
