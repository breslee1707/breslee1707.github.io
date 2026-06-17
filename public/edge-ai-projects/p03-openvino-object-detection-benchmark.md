# P03 - Live Object Detection và benchmark với OpenVINO

## Nguồn gốc nên học

- OpenVINO Live Object Detection notebook: https://docs.openvino.ai/2024/notebooks/object-detection-with-output.html
- OpenVINO Benchmark Tool: https://docs.openvino.ai/nightly/get-started/learn-openvino/openvino-samples/benchmark-tool.html
- OpenVINO notebooks repo: https://github.com/openvinotoolkit/openvino_notebooks

## Mục tiêu

Project này giúp các bạn hiểu một hướng deployment khác ngoài TensorFlow Lite: dùng OpenVINO để tối ưu và chạy inference, đặc biệt hữu ích trên phần cứng Intel hoặc các hệ thống edge cần benchmark nghiêm túc.

## Cách triển khai tối thiểu

1. Chạy notebook object detection với video sample hoặc webcam.
2. Ghi lại latency/FPS trong app thực tế.
3. Chạy OpenVINO Benchmark Tool trên cùng model.
4. So sánh số đo từ app thực tế và benchmark tool.
5. Ghi chú device dùng để chạy: CPU, GPU, AUTO hoặc cấu hình khác nếu có.

## Các bạn cần nộp

- Notebook đã chạy thành công.
- Ảnh/video kết quả detection.
- Bảng benchmark: device, precision nếu có, latency, throughput.
- Ghi chú giải thích vì sao benchmark tool và app thực tế có thể ra số khác nhau.

## Nâng cấp để đưa vào CV

- So sánh OpenVINO với ONNX Runtime hoặc TFLite trên cùng model nếu có thể.
- Thêm đo p50/p95 latency, không chỉ đo trung bình.
- So sánh model nhỏ/lớn và phân tích trade-off accuracy/FPS.
- Viết CLI chọn model và input video.

## Câu hỏi mentor

- Throughput cao có luôn đồng nghĩa với latency thấp không?
- Vì sao app thực tế thường chậm hơn benchmark model thuần?
- Khi nào nên ưu tiên latency, khi nào nên ưu tiên throughput?

## Tiêu chí hoàn thành

Project đạt yêu cầu khi các bạn biết dùng benchmark như một công cụ kỹ thuật, không chỉ cảm nhận bằng mắt là nhanh hay chậm. Bảng đo phải đủ rõ để người khác lặp lại được.
