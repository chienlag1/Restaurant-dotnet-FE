
import { useEffect } from "react";

const ChatbaseWidget = () => {
  useEffect(() => {
    // Kiểm tra xem window.chatbase đã tồn tại và khởi tạo chưa
    if (
      !window.chatbase ||
      (typeof window.chatbase === "function" &&
        window.chatbase("getState") !== "initialized")
    ) {
      // Hàm xếp hàng lệnh (queue) cho chatbase
      const chatbaseFunc = (...args) => {
        chatbaseFunc.q = chatbaseFunc.q || [];
        chatbaseFunc.q.push(args);
      };

      // Tạo Proxy để xử lý các lệnh chatbase trước khi script tải xong
      const proxy = new Proxy(chatbaseFunc, {
        get(target, prop) {
          if (prop === "q") return target.q;
          return (...args) => target(prop, ...args);
        },
      });

      // Gán proxy vào window.chatbase
      window.chatbase = proxy;

      // Hàm tải script Chatbase
      const onLoad = () => {
        // Kiểm tra xem script đã tồn tại chưa để tránh thêm trùng
        if (!document.getElementById("bSRbSU7jo-ZgsxkSxKOn6")) {
          const script = document.createElement("script");
          script.src = "https://www.chatbase.co/embed.min.js";
          script.id = "bSRbSU7jo-ZgsxkSxKOn6";
          script.setAttribute("domain", "www.chatbase.co");
          // Xử lý lỗi tải script (tùy chọn)
          script.onerror = () =>
            console.error("Failed to load Chatbase script");
          document.body.appendChild(script);
        }
      };

      // Tải script ngay nếu trang đã sẵn sàng, hoặc chờ sự kiện load
      if (document.readyState === "complete") {
        onLoad();
      } else {
        window.addEventListener("load", onLoad);
        // Cleanup để gỡ bỏ event listener
        return () => window.removeEventListener("load", onLoad);
      }
    }
  }, []);

  return null;
};

export default ChatbaseWidget;

