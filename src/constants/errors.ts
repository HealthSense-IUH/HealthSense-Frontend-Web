export const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại dữ liệu.",
  401: "Vui lòng đăng nhập để tiếp tục.",
  403: "Bạn không có quyền truy cập tài nguyên này.",
  404: "Không tìm thấy tài nguyên được yêu cầu.",
  409: "Dữ liệu đã tồn tại hoặc bị trùng lặp.",
  429: "Quá nhiều yêu cầu. Vui lòng đợi một lát rồi thử lại.",
  500: "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.",
  502: "Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.",
  503: "Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.",
  504: "Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.",
}

export const AUTH_ERROR_FALLBACK_MESSAGES: Record<number, string> = {
  1001: "Email hoặc mật khẩu không đúng.",
  1002: "Email này đã được đăng ký.",
  1003: "Tài khoản đã bị khóa.",
  1004: "Phiên đăng nhập đã hết hạn.",
  1005: "Không tìm thấy phiên đăng nhập.",
  1006: "Phiên đăng nhập không còn hợp lệ.",
  1007: "Token không hợp lệ hoặc đã hết hạn.",
  1200: "Dữ liệu nhập chưa hợp lệ.",
  403: "Bạn không có quyền truy cập.",
  429: "Thao tác quá nhanh, vui lòng thử lại sau.",
}
