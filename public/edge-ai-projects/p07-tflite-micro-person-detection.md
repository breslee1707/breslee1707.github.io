# P07 - Person Detection trên microcontroller/ESP32 với TFLite Micro

## Nguồn gốc nên học

- TensorFlow Lite Micro Person Detection example: https://github.com/tensorflow/tflite-micro/tree/main/tensorflow/lite/micro/examples/person_detection
- Espressif esp-tflite-micro: https://github.com/espressif/esp-tflite-micro

## Mục tiêu

Project này giúp các bạn hiểu giới hạn của vision AI trên microcontroller. Đây không phải object detection đầy đủ như trên Raspberry Pi, mà thường là bài toán rất nhỏ: có người/không có người hoặc một output cực kỳ giới hạn.

## Cách triển khai tối thiểu

1. Build và chạy example trên target được hỗ trợ, hoặc chạy test trên máy phát triển nếu chưa có board.
2. Đọc cấu trúc project: model_settings, image_provider, detection_responder, main_functions.
3. Xác định input size, output score và threshold.
4. Ghi lại thời gian invoke và memory nếu log có hỗ trợ.
5. Thêm output đơn giản: serial, LED hoặc event.

## Các bạn cần nộp

- Sơ đồ: camera/input -> tensor -> invoke -> score -> output.
- Ảnh hoặc log demo.
- Ghi chú 5 giới hạn của vision AI trên MCU.
- Đề xuất 3 cách giảm false positive.

## Nâng cấp để đưa vào CV

- Thêm logic cooldown để không gửi cảnh báo liên tục.
- Thêm MQTT event qua Wi-Fi nếu dùng ESP32.
- Thay output LED/serial bằng event có timestamp.
- Viết phần phân tích memory budget: model, tensor arena, frame buffer.

## Câu hỏi mentor

- Vì sao MCU không phù hợp cho object detection nặng?
- Nếu input image quá lớn, vấn đề đầu tiên sẽ là RAM, latency hay model size?
- Cần làm gì để giảm báo sai khi ánh sáng thay đổi?

## Tiêu chí hoàn thành

Project đạt yêu cầu khi các bạn chứng minh được mình hiểu ràng buộc MCU: bộ nhớ, input size, inference time và output logic. Đây là project nhỏ nhưng rất mạnh để thể hiện tư duy TinyML.
