# Review và gợi ý sửa Google Docs Edge AI

Trang project public đã tạo:

https://github.com/breslee1707/breslee1707.github.io/tree/main/edge-ai-projects

## 1. Link project nên gắn vào lộ trình

Gắn vào phần cuối tài liệu "Lộ trình học Edge AI", sau mục "Lời khuyên cho các bạn":

```text
Tài nguyên project thực hành public:
https://github.com/breslee1707/breslee1707.github.io/tree/main/edge-ai-projects

Nếu các bạn muốn đi theo camera/computer vision Edge AI, hãy bắt đầu với P01, P02, P03.
Nếu các bạn muốn đi theo sensor/industrial IoT, hãy bắt đầu với P04 và P08.
Nếu các bạn muốn đi theo TinyML/MCU, hãy bắt đầu với P05, P06, P07.
Nếu chưa có phần cứng, các bạn vẫn có thể làm P03 với OpenVINO, P08 với ONNX Runtime hoặc P04 bằng dữ liệu mô phỏng trên laptop.
```

## 2. Review lộ trình học Edge AI

Điểm nên sửa:

1. Câu "21 cuốn sách chuyên ngành" chưa khớp với nội dung đang liệt kê trong doc hiện tại. Nếu tài liệu chưa thật sự list đủ 21 nguồn, nên đổi thành "bộ tài liệu/sách chuyên ngành trong thư viện".
2. Lộ trình hiện tại bỏ qua một mảng quan trọng: signal processing/time-series. Edge AI không chỉ có camera; sensor, audio, vibration và IMU cũng rất quan trọng.
3. Phần "bỏ qua đạo hàm, tích phân" nên nói mềm hơn. Deep learning không cần chứng minh toán nặng lúc đầu, nhưng vẫn cần hiểu gradient/loss/optimization ở mức trực giác.
4. Câu về Machine Learning Systems "ép một mô hình khổng lồ vào con chip nhỏ" hơi quá quảng cáo. Sách ML systems rộng hơn: lifecycle, deployment, latency, privacy, monitoring, resource trade-off.
5. Phần IoT không nên nói "đẩy dữ liệu lên cloud" như mục tiêu mặc định. Tinh thần edge là chỉ gửi event/metadata khi cần, không gửi toàn bộ raw data.
6. Cần gắn link project public vào lộ trình để người học thấy ngay đầu ra thực hành.

Đoạn thay thế gợi ý cho mở đầu:

```text
Dưới đây là luồng học tập được chọn lọc từ bộ tài liệu/sách chuyên ngành trong thư viện, tập trung vào mục tiêu thực tế: từ lập trình, dữ liệu, AI core, computer vision/sensor processing đến embedded deployment và Edge AI system design.

Lộ trình này không yêu cầu các bạn đọc hết tất cả sách. Mỗi giai đoạn chỉ cần đọc đúng phần phục vụ kỹ năng đầu ra, sau đó lập tức làm lab hoặc project nhỏ. Mục tiêu cuối cùng là các bạn có portfolio Edge AI thật: có code, có benchmark, có demo, có báo cáo trade-off.
```

Đoạn thay thế gợi ý cho tổng quan giai đoạn:

```text
Giai đoạn 1: Code và dữ liệu -> Giai đoạn 2: Toán, signal và AI core -> Giai đoạn 3: Computer Vision/Sensor AI -> Giai đoạn 4: Nhúng và Edge platform -> Giai đoạn 5: Tối ưu, IoT và capstone
```

Đoạn bổ sung gợi ý sau Giai đoạn 2:

```text
Bổ sung bắt buộc: Tín hiệu và dữ liệu cảm biến

Mục tiêu: Hiểu dữ liệu edge không chỉ là ảnh. Nhiều bài toán thực tế đến từ sensor, audio, vibration, IMU và time-series.

Sách: Hands-on Signal Analysis with Python; Discrete-Time Signal Processing.

Chỉ cần tập trung:
- Sampling, noise, filtering.
- Sliding window cho time-series.
- FFT/spectrum ở mức trực giác.
- Feature extraction: mean, std, energy, peak, frequency component.

Project gắn với phần này:
- P04 Predictive Maintenance Vibration.
- P05 Fall Detection Wearable.
```

Đoạn thay thế gợi ý cho Machine Learning Systems:

```text
Tại sao đọc: Đây là phần giúp các bạn chuyển từ "train được model" sang "triển khai được hệ thống AI thật". Trong Edge AI, model tốt chưa đủ; các bạn còn phải quan tâm latency, memory, model size, privacy, dependency, monitoring và trade-off giữa accuracy với tài nguyên phần cứng.
```

Đoạn thay thế gợi ý cho IoT:

```text
Tại sao đọc: Sau khi model chạy được trên edge, các bạn cần biết cách biến kết quả inference thành event có giá trị. Thay vì gửi toàn bộ ảnh/video/raw sensor lên cloud, hệ thống edge tốt thường chỉ gửi metadata, cảnh báo hoặc log cần thiết.
```

## 3. Review bài tập thực hành và project

Điểm nên sửa:

1. Văn phong nên đồng nhất xưng "các bạn", không lúc "bạn", lúc "học viên".
2. Một số câu quá khẩu ngữ như "sếp cần", "chết đứng", "báo động láo", "màn hình xanh" nên giảm lại để tài liệu trông chuyên nghiệp hơn.
3. Lời khuyên tạo dữ liệu anomaly bằng cách gắn vật nặng vào cánh quạt có thể nguy hiểm. Nên đổi thành "mô phỏng bằng vibration motor, dữ liệu public, thiết bị lab an toàn, hoặc quay ở tốc độ thấp có bảo hộ".
4. Bài Haar Cascade nên ghi rõ đây là baseline cổ điển, không phải hướng modern object detection chính. Nên khuyên so sánh với TFLite/OpenVINO.
5. Câu "Int8 nhẹ đi 4 lần và chạy lẹ hơn" nên sửa thành "có thể nhẹ hơn rõ rệt; tốc độ phụ thuộc runtime và phần cứng". Không phải mọi hardware đều tăng tốc với INT8.
6. Cần thêm phần project curated public đã upload.

Đoạn thay thế gợi ý cho bài 4.2:

```text
Bài tập 4.2 (Tối ưu AI): Lấy mô hình CNN hoặc MobileNet nhỏ đã train/fine-tune ở Giai đoạn 2. Export sang TensorFlow Lite/LiteRT hoặc ONNX, sau đó đo model size, latency p50/p95 và accuracy trước/sau tối ưu.

Sách tham khảo: Machine-Learning-Systems (Reddi) - phần Optimization, Quantization và Deployment.

Tips từ mentor: Khi chuyển Float32 sang INT8, model có thể nhẹ hơn đáng kể và có thể chạy nhanh hơn trên hardware/runtime hỗ trợ tốt INT8. Tuy nhiên tốc độ không phải lúc nào cũng tăng, và accuracy có thể giảm nếu calibration không tốt. Điều quan trọng là các bạn phải đo bằng số liệu: model size, latency và accuracy, không kết luận bằng cảm tính.
```

Đoạn thay thế gợi ý cho predictive maintenance data:

```text
Tips từ mentor:

Cái khó nhất của dự án này là lấy dữ liệu "máy hỏng" một cách an toàn. Các bạn không nên làm hỏng thiết bị thật hoặc gắn vật nặng vào cánh quạt đang quay nếu không có bảo hộ và môi trường lab phù hợp.

Cách an toàn hơn:
- Dùng dataset public hoặc project mẫu từ Edge Impulse.
- Mô phỏng tín hiệu rung bằng Python để học pipeline trước.
- Dùng vibration motor nhỏ hoặc thiết bị lab có tốc độ thấp.
- Nếu dùng quạt/bộ phận quay, chỉ làm ở tốc độ thấp, có lồng bảo vệ và có người giám sát.

Trong báo cáo, các bạn cần nói rõ anomaly là dữ liệu thật, dữ liệu mô phỏng hay dữ liệu tạo trong điều kiện lab.
```

Đoạn thêm vào cuối tài liệu bài tập:

```text
Phần 3: Project mẫu uy tín trên mạng để học theo

Bộ project public:
https://github.com/breslee1707/breslee1707.github.io/tree/main/edge-ai-projects

Mục tiêu của phần này là giúp các bạn không bị kẹt ở câu hỏi "nên làm project gì". Mỗi project đều dựa trên nguồn uy tín, nhưng các bạn không nên clone rồi nộp lại. Hãy chạy bản mẫu, hiểu pipeline, sau đó thêm thay đổi riêng: đổi dữ liệu, đo benchmark, thêm logging, thêm MQTT/HTTP event, hoặc chạy trên board khác.

Nếu muốn đi theo camera/computer vision Edge AI: bắt đầu với P01, P02, P03.
Nếu muốn đi theo sensor/industrial IoT: bắt đầu với P04 và P08.
Nếu muốn đi theo TinyML/MCU: bắt đầu với P05, P06, P07.
Nếu chưa có phần cứng: bắt đầu với P03, P04 mô phỏng dữ liệu hoặc P08 trên laptop.
```

## 4. Ghi chú về quyền chỉnh sửa Google Docs

Hiện tại Google Drive connector đọc được tài liệu nhưng bị thiếu OAuth scope để sửa nội dung Google Docs. Khi reconnect Google Drive với quyền edit Docs/Drive, có thể áp trực tiếp các thay đổi trên vào hai file Google Docs.
