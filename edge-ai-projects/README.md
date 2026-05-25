# Edge AI Project Guides

Bộ project này dùng để gắn vào lộ trình Edge AI và bài tập thực hành. Mục tiêu không phải là clone project có sẵn rồi nộp lại, mà là học theo các tutorial/repo uy tín, chạy lại được, hiểu từng khối kỹ thuật, sau đó biến thành phiên bản riêng của các bạn.

## Cách dùng bộ project

1. Chọn project gần với mục tiêu nghề nghiệp của các bạn.
2. Đọc nguồn gốc project/tutorial chính thức.
3. Chạy lại bản mẫu tối thiểu.
4. Thêm ít nhất một thay đổi có ý nghĩa: đổi dữ liệu, đổi runtime, thêm benchmark, thêm logging, thêm MQTT/HTTP event, hoặc chạy trên board khác.
5. Viết README riêng, có ảnh/video demo và bảng benchmark.

## Danh sách project

| Mã | Project | Phù hợp với |
| --- | --- | --- |
| P01 | [Object Detection với TensorFlow Lite/LiteRT trên Raspberry Pi](./p01-tflite-object-detection-raspberry-pi.md) | Camera AI, Raspberry Pi, TFLite |
| P02 | [Smart Security Camera từ object detection có sẵn](./p02-smart-security-camera.md) | CV portfolio, cảnh báo event, MQTT/HTTP |
| P03 | [Live Object Detection và benchmark với OpenVINO](./p03-openvino-object-detection-benchmark.md) | OpenVINO, benchmark latency/throughput |
| P04 | [Predictive Maintenance bằng vibration anomaly detection](./p04-predictive-maintenance-vibration.md) | Sensor AI, industrial IoT, time-series |
| P05 | [Fall Detection wearable bằng accelerometer TinyML](./p05-fall-detection-wearable.md) | IMU, wearable, TinyML |
| P06 | [Magic Wand / Gesture Recognition với TFLite Micro](./p06-tflite-micro-magic-wand.md) | Gesture, accelerometer, microcontroller |
| P07 | [Person Detection trên microcontroller/ESP32](./p07-tflite-micro-person-detection.md) | Vision AI trên MCU, ESP32, TFLite Micro |
| P08 | [ONNX Runtime IoT/Edge deployment](./p08-onnx-runtime-edge-deployment.md) | ONNX, runtime độc lập framework, deployment |

## Chọn project theo mục tiêu

Nếu các bạn muốn đi theo camera/computer vision Edge AI, hãy ưu tiên P01, P02, P03.

Nếu các bạn muốn đi theo sensor/industrial IoT, hãy ưu tiên P04 và P08.

Nếu các bạn muốn đi theo TinyML/MCU, hãy ưu tiên P05, P06, P07.

Nếu chưa có phần cứng, các bạn vẫn có thể bắt đầu với P03, P04 mô phỏng dữ liệu, hoặc P08 trên laptop.

## Checklist portfolio

Project chỉ đạt mức demo nếu chỉ chạy được đúng tutorial gốc, không có benchmark, không có README rõ ràng và không giải thích được input/output của model.

Project đạt mức portfolio nếu có repo riêng sạch sẽ, README chạy lại được, video/ảnh demo, benchmark latency/FPS/model size, phân tích lỗi và ít nhất một thay đổi có ý nghĩa so với nguồn gốc.
