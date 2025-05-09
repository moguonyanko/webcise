package webcise;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import jakarta.json.Json;
import jakarta.json.JsonException;
import jakarta.json.stream.JsonGenerator;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.RandomStringUtils;

/**
 * 参考:
 * https://www.baeldung.com/java-random-string
 */
@WebServlet(name = "RandomString", urlPatterns = {"/RandomString"})
public class RandomString extends HttpServlet {

    private static final int DEFAULT_COUNT = 16;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setHeader("Cache-Control", "no-store");

        int count = DEFAULT_COUNT;
        String countParam = request.getServletContext().getInitParameter("count");
        if (countParam != null && !countParam.isEmpty()) {
            count = Integer.parseInt(countParam);
        }

        String value = RandomStringUtils.randomAlphanumeric(count);

        try (JsonGenerator generator
                = Json.createGeneratorFactory(null).createGenerator(response.getWriter())) {
            generator.writeStartObject();
            generator.write("value", value);
            generator.writeEnd();
        } catch (JsonException exception) {
            exception.printStackTrace(System.err);
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    exception.getMessage());
        }

    }

}
