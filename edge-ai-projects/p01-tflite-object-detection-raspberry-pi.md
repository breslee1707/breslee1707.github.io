# P01 - Object Detection với TensorFlow Lite/LiteRT trên Raspberry Pi

## Nguồn gốc nên học

- LiteRT ObjectDetector task library: https://ai.google.dev/edge/litert/libraries/task_library/object_detector
- TensorFlow examples Raspberry Pi object detection: https://github.com/tensorflow/examples/tree/master/lite/examples/object_detection/raspberry_pi
- Raspberry Pi Picamera2 + TensorFlow Lite: https://www.raspberrypi.com/news/using-the-picamera2-library-with-tensorflow-lite/

## Mục tiêu

Project này giúp các bạn hiểu pipeline camera -> preprocess -> TFLite inference -> bounding box -> hiển thị kết quả. Đây là project nền tảng nếu các bạn muốn làm camera AI trên edge device.

## Cách triển khai tối thiểu

1. Chuẩn bị Raspberry Pi hoặc laptop có webcam.
2. Chạy ví dụ object detection bằng TensorFlow Lite/TFLite runtime.
3. Dùng model nhẹ như EfficientDet-Lite hoặc SSD MobileNet.
4. In FPS hoặc latency từng frame.
5. Chỉ giữ detection có confidence cao hơn ngưỡng, ví dụ 0.5.
6. Lưu ảnh khi phát hiện class quan trọng, ví dụ person.

## Các bạn cần nộp

- Link repo cá nhân.
- README có sơ đồ pipeline.
- Ảnh hoặc video demo.
- Bảng benchmark với ít nhất 3 cấu hình: độ phân giải cao, độ phân giải thấp, crop ROI hoặc headless mode.

## Nâng cấp để đưa vào CV

- Thêm vùng quan tâm ROI để tránh chạy AI trên toàn bộ khung hình.
- Thêm motion detection bằng OpenCV, chỉ gọi AI khi có chuyển động.
- Thêm gửi cảnh báo MQTT/HTTP khi phát hiện người.
- Chạy app như `systemd` service để tự khởi động cùng Raspberry Pi.

## Câu hỏi mentor

- FPS giảm do model inference, camera I/O hay do phần hiển thị kết quả?
- Nếu tắt visualization và chỉ gửi event, latency thay đổi thế nào?
- Model báo sai trong tình huống ánh sáng yếu hay vật thể bị che khuất không?

## Tiêu chí hoàn thành

Project đạt yêu cầu khi các bạn không chỉ chạy được camera demo, mà còn đo được latency/FPS, biết class nào quan trọng, biết tình huống nào model báo sai và có ít nhất một tối ưu cho edge.
