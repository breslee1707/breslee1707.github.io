# P06 - Magic Wand / Gesture Recognition với TensorFlow Lite Micro

## Nguồn gốc nên học

- TensorFlow Lite Micro Magic Wand example: https://github.com/tensorflow/tflite-micro/tree/main/tensorflow/lite/micro/examples/magic_wand
- Magic Wand project by Pete Warden: https://github.com/petewarden/magic_wand

## Mục tiêu

Project này giúp các bạn bước vào TinyML thật sự: model nhỏ, RAM ít, inference bằng C/C++ và dữ liệu đến từ cảm biến chuyển động. Đây là project tốt để hiểu khác biệt giữa AI chạy trên laptop và AI chạy trên microcontroller.

## Cách triển khai tối thiểu

1. Chạy example có sẵn trên Arduino Nano 33 BLE Sense hoặc board tương đương.
2. Đọc luồng dữ liệu accelerometer/gyroscope.
3. Thu thêm dữ liệu gesture riêng của các bạn.
4. Train lại model hoặc thay đổi nhãn gesture nếu tutorial hỗ trợ.
5. In kết quả dự đoán ra serial monitor.

## Các bạn cần nộp

- Video demo nhận diện ít nhất 2 gesture.
- Log serial output.
- Bảng model size và RAM/flash nếu đo được.
- Ghi chú gesture nào model hay nhầm và vì sao.

## Nâng cấp để đưa vào CV

- Thêm gesture thứ 3.
- Thêm smoothing/voting để giảm dự đoán nhảy lung tung.
- Thêm output điều khiển LED/buzzer khi nhận diện gesture.
- Viết lại README giải thích data collection -> train -> convert -> deploy.

## Câu hỏi mentor

- Vì sao một gesture cần nhiều mẫu từ nhiều người hoặc nhiều tốc độ khác nhau?
- Model nhỏ có thể nhầm khi gesture quá nhanh/chậm không?
- Voting trên nhiều window giúp ổn định output ra sao?

## Tiêu chí hoàn thành

Project đạt yêu cầu khi các bạn hiểu được inference loop trên microcontroller, không chỉ nhìn serial monitor in ra nhãn. Các bạn cần giải thích được model nằm ở đâu, tensor arena là gì và output được xử lý thế nào.
