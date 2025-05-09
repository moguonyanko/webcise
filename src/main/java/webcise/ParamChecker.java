package webcise;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet(name = "ParamChecker", urlPatterns = {"/ParamChecker"})
public class ParamChecker extends HttpServlet {

	protected void processRequest(HttpServletRequest request, HttpServletResponse response)
		throws ServletException, IOException {
		
		response.setContentType("application/json;charset=UTF-8");
		
		try (PrintWriter out = response.getWriter()) {
			Map<String, String[]> names = request.getParameterMap();
			StringBuilder result = new StringBuilder();
			
			result.append("{");
			for(String name : names.keySet()){
				String value = request.getParameter(name);
				result.append("\n\t\"").append(name).append("\" : ");
				result.append("\"").append(value).append("\"");
			}
			result.append("\n}");
			
			out.println(result.toString());
		}
	}

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
		throws ServletException, IOException {
		processRequest(request, response);
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
		throws ServletException, IOException {
		processRequest(request, response);
	}

}
