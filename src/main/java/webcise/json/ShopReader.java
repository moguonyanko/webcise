package webcise.json;

import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.json.JsonReader;
import jakarta.json.stream.JsonParsingException;
import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet(name = "ShopReader", urlPatterns = {"/shopreader"})
public class ShopReader extends HttpServlet {

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse res)
		throws ServletException, IOException {
		res.setContentType("application/json;charset=UTF-8");
		PrintWriter out = res.getWriter();

		ServletContext context = req.getServletContext();
		String path = "/WEB-INF/resources/sample1.json";

		try (InputStream stream = context.getResourceAsStream(path);
			JsonReader reader = Json.createReader(stream)) {
			JsonObject json = reader.readObject();
			String target = req.getParameter("shop");
			JsonObject result = json.getJsonObject(target);

			if (result != null) {
				out.print(result.toString());
			} else {
				out.print(Jsons.getEmptyJson().toString());
			}
		} catch (JsonParsingException ex) {
			JsonObjectBuilder builder = Json.createObjectBuilder()
				.add("reason", ex.getMessage());
			out.print(builder.build().toString());
		}
	}

}
