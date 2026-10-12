# Quy trình PR và deploy trên Vercel Hobby

Repo này là public. Hai project `ai-search-client` và `ai-search-admin` deploy production từ `main`.
Chủ repo và tài khoản Vercel là `QuocViett-69`. Tài khoản này phải liên kết đúng GitHub tại
Vercel **Account Settings → Login Connections**.

## Teammate gửi PR

1. Giữ tên và email Git của chính mình; không đổi tác giả commit sang tài khoản chủ repo.
2. Tạo nhánh riêng từ `main` mới nhất:

   ```bash
   git fetch origin
   git switch -c feat/mo-ta-thay-doi origin/main
   ```

3. Sửa code, commit các file cần thiết và push nhánh:

   ```bash
   git push -u origin HEAD
   ```

4. Mở PR trên GitHub với base là `main`. Ghi các thay đổi và kết quả kiểm tra trong PR.
   `CODEOWNERS` yêu cầu review từ `QuocViett-69`.

## Chủ repo review và merge

1. Đọc diff và các caller liên quan. Chạy kiểm tra phù hợp với thay đổi:
   `npm run lint`, `npm run test:api`, `npm run test:client`, `npm run test:admin`.
2. Nếu có lỗi, yêu cầu teammate sửa trong cùng nhánh; review lại khi có commit mới.
3. Đăng nhập GitHub bằng `QuocViett-69`, approve PR của teammate rồi chọn
   **Create a merge commit**. Không để teammate bấm merge vào `main`.
   Merge commit do chủ repo tạo; commit gốc vẫn giữ đúng tác giả.

Ruleset của `main` yêu cầu PR, giới hạn việc cập nhật nhánh cho chủ repo qua PR và chặn
force-push/xóa nhánh. Chủ repo có ngoại lệ qua PR để xử lý cả PR do chính mình tạo,
vì GitHub không cho người tạo PR tự approve. Chủ repo vẫn phải review trước khi merge.
Chỉ bật phương thức merge commit cho repo.

## Kiểm tra deploy

Sau khi merge, kiểm tra deployment mới của cả hai project trên Vercel đến trạng thái **Ready**,
rồi mở [Client](https://ai-search-client.vercel.app) và [Admin](https://ai-search-admin.vercel.app).
Nếu Vercel yêu cầu xác nhận deployment của PR public, chủ repo dùng liên kết xác nhận trên PR.

`REACT_APP_API_URL` trên cả hai project phải trỏ tới API đang chạy. Tunnel Cloudflare tạm có thể
đổi URL hoặc hết hiệu lực; cập nhật biến môi trường và redeploy cả hai frontend khi URL thay đổi.

Tham khảo: [Vercel Git deployments](https://vercel.com/docs/git),
[GitHub rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets).
