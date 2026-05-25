# P08 - ONNX Runtime IoT/Edge deployment

## Nguồn gốc nên học

- ONNX Runtime IoT/Edge tutorials: https://onnxruntime.ai/docs/tutorials/iot-edge/
- ONNX Runtime inference overview: https://onnxruntime.ai/inference

## Mục tiêu

Project này giúp các bạn hiểu workflow export model sang ONNX và chạy inference bằng runtime độc lập với framework train. Đây là kỹ năng quan trọng khi project cần chuyển model giữa PyTorch, TensorFlow, OpenVINO, TensorRT hoặc runtime khác nhau.

## Cách triển khai tối thiểu

1. Train hoặc lấy một model nhỏ đã có.
2. Export model sang ONNX.
3. Viết script inference bằng `onnxruntime`.
4. Đo latency 100 lần chạy.
5. So sánh output với model gốc nếu còn giữ pipeline train.
6. Ghi chú input name, shape, dtype và preprocessing.

## Các bạn cần nộp

- File export_model.py hoặc notebook export.
- File infer_onnx.py.
- Bảng benchmark p50/p95 latency.
- Ghi chú các lỗi thường gặp: input name sai, shape sai, dtype sai, preprocessing không khớp.

## Nâng cấp để đưa vào CV

- So sánh ONNX Runtime CPU với OpenVINO/TFLite nếu cùng model hỗ trợ.
- Viết wrapper chung để đổi runtime nhưng giữ cùng preprocessing/postprocessing.
- Tạo CLI: `python infer.py --runtime onnx --model model.onnx --input sample.jpg`.
- Thêm kiểm tra output drift giữa model gốc và model ONNX.

## Câu hỏi mentor

- Export sang ONNX có làm thay đổi output không?
- Vì sao preprocessing không khớp có thể làm model sai dù file ONNX đúng?
- Execution provider ảnh hưởng latency thế nào?

## Tiêu chí hoàn thành

Project đạt yêu cầu khi các bạn không chỉ export được file `.onnx`, mà còn chạy inference độc lập, đo latency và giải thích được input/output contract của model.
