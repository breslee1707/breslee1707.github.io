# P02 - Smart Security Camera từ object detection có sẵn

## Nguồn gốc nên học

- EdjeElectronics TensorFlow Lite Object Detection on Android and Raspberry Pi: https://github.com/EdjeElectronics/TensorFlow-Lite-Object-Detection-on-Android-and-Raspberry-Pi
- Raspberry Pi deploy guide: https://github.com/EdjeElectronics/TensorFlow-Lite-Object-Detection-on-Android-and-Raspberry-Pi/blob/master/deploy_guides/Raspberry_Pi_Guide.md

## Mục tiêu

Project này biến object detection thành một hệ thống camera an ninh đơn giản. Điểm quan trọng là các bạn không chỉ detect vật thể, mà phải biết thiết kế event pipeline: khi nào gọi AI, khi nào lưu ảnh, khi nào gửi cảnh báo.

## Cách triển khai tối thiểu

1. Chạy được object detection từ webcam hoặc Raspberry Pi Camera.
2. Chọn một use case nhỏ: phát hiện người trước cửa, phát hiện xe trong bãi, hoặc phát hiện vật thể trên bàn học.
3. Viết cấu hình class cần quan tâm.
4. Khi phát hiện event, lưu timestamp, class, confidence và image_path.
5. Ghi log latency và số event phát hiện trong mỗi lần chạy.

## Các bạn cần nộp

- File config class cần detect.
- 10 ảnh event thật hoặc video demo 1 phút.
- Bảng thống kê false positive/false negative đơn giản.
- Báo cáo ngắn: khi nào hệ thống báo sai và cách giảm báo sai.

## Nâng cấp để đưa vào CV

- Thêm ROI, ví dụ chỉ theo dõi vùng cửa ra vào.
- Thêm motion detection trước khi gọi model AI.
- Thêm cooldown để không gửi cảnh báo liên tục.
- Gửi event JSON qua MQTT/HTTP.
- Tạo dashboard đơn giản để xem event.

## Câu hỏi mentor

- Vì sao không nên chạy model AI trên mọi frame nếu thiết bị yếu?
- ROI giúp giảm false positive hay giảm latency nhiều hơn?
- Nếu có bóng cây, chó mèo hoặc người đi xa camera, hệ thống xử lý thế nào?

## Tiêu chí hoàn thành

Project đạt yêu cầu khi các bạn chứng minh được hệ thống có logic edge thật: idle -> motion detected -> inference -> event -> cooldown. Đây là thứ nhà tuyển dụng nhìn vào sẽ thấy các bạn hiểu sản phẩm, không chỉ biết chạy model.
