package webcise.json;

import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.websocket.OnMessage;
import jakarta.websocket.server.ServerEndpoint;

/**
 * 別のサーブレットのurlPatternsとServerEndpointの値が衝突していても，
 * WebSocketのプロトコルでリクエストが行われればこちらが参照される。
 */
@ServerEndpoint("/shopinfo")
public class ShopQuery {

    /**
     * OnMessageアノテーションを指定したメソッドの引数の型が誤っていると
     * コンテキストのデプロイ時に例外が発生してデプロイに失敗する。
     * シグネチャが誤っているとは例えば引数無しになっている等である。
     * 戻り値の型がJsonObjectになっているとデプロイはできるがリクエストを
     * 受け付けた時に例外が発生する。
     */
    @OnMessage
    public String query(String message) {
        JsonObjectBuilder builder = Json.createObjectBuilder();
        
        AnyShop.getShops().forEach(shop -> {
            JsonObjectBuilder jb = Json.createObjectBuilder();
            JsonArrayBuilder ab = Json.createArrayBuilder();
            shop.getItemNames().stream().forEach(ab::add);
            jb.add("items", ab);
            builder.add(shop.getName(), jb);
        });
        
        JsonObject json = builder.build();
        
        return json.toString();
    }
    
}
