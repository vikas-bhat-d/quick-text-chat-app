import { SocketProvider } from "../providers/Socket";
import { MessageProvider } from "../providers/Messages";
import { Outlet } from "react-router-dom";

const ChatLayout = () => {
  return (
    <SocketProvider>
      <MessageProvider>
        <Outlet />
      </MessageProvider>
    </SocketProvider>
  );
};
export default ChatLayout;
