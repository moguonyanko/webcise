package webcise;

import java.io.IOException;

import jakarta.json.Json;
import jakarta.json.JsonException;
import jakarta.json.stream.JsonGenerator;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * urlPatternsの大文字小文字は区別される。異なった名前でリクエストすると
 * 404エラーになる。
 */
@WebServlet(name = "Login", urlPatterns = {"/Login"})
public class Login extends HttpServlet {

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse res)
		throws ServletException, IOException {
		String validName = "admin";
		String validPassword = "secret";

		String name = req.getParameter("name");
		String password = req.getParameter("password");

		if (validName.equals(name) && validPassword.equals(password)) {
			try (JsonGenerator generator =
				Json.createGeneratorFactory(null).createGenerator(res.getWriter())) {
				generator.writeStartObject();
				generator.writeStartObject("result");
				generator.write("name", name);
				generator.write("message", "Welcome " + name + "!");
				generator.writeEnd();
				generator.writeEnd();
			} catch (JsonException exception) {
				exception.printStackTrace(System.err);
				res.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
					exception.getMessage());
			}
		} else {
			res.sendError(HttpServletResponse.SC_UNAUTHORIZED,
				"Invalid accounts!");
		}
	}

}
