package webcise.json;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.json.Json;
import jakarta.json.JsonException;
import jakarta.json.stream.JsonGenerator;

@WebServlet(name = "ShopInfo", urlPatterns = {"/shopinfo"})
public class ShopInfo extends HttpServlet {

    private <T> void writeShop(AnyShop<T> shop, JsonGenerator generator) {
        generator.writeStartObject(shop.getName());
        generator.writeStartArray("items");
        shop.getItemNames().stream()
                .forEach(generator::write);
        generator.writeEnd();
        generator.writeEnd();
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {
        res.setContentType("application/json;charset=UTF-8");

        /**
         * JsonGeneratorのcloseが呼び出されなければPrintWriterには書き出されず 
         * レスポンスボディは空になる。
         */
        try (JsonGenerator generator = 
                Json.createGeneratorFactory(null).createGenerator(res.getWriter())) {
            generator.writeStartObject();
            AnyShop.getShops().forEach(shop -> writeShop(shop, generator));
            generator.writeEnd();
        } catch (JsonException exception) {
            exception.printStackTrace(System.err);
            /**
             * try-with-resources文で記述するとPrintWriterが先にcloseされる。
             * sendError前にPrintWriterがcloseされていると例外がスローされる。
             */
            res.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    exception.getMessage());
        }
    }

}
