package webcise;

import jakarta.websocket.OnMessage;
import jakarta.websocket.server.ServerEndpoint;

@ServerEndpoint(value = "/greeting")
public class Greeting {
	
	@OnMessage
	public String onMessage(String message) {
		return message + " 受信しました。こちらはサーバです。";
	}

}
