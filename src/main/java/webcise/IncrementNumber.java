package webcise;

import java.io.IOException;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet(name = "IncrementNumber", urlPatterns = {"/IncrementNumber"})
public class IncrementNumber extends HttpServlet {

    // TODO: JsonライブラリでJSON化すること。
    private static class User {
        private int number;

        private void increment() {
            number++;
        }
        
        private String toJson() {
           var json = new StringBuilder();
           json.append("{");
           json.append("\"number\":").append(number);
           json.append("}");
           return json.toString();
        }
    }

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Methods", "POST");
        response.setHeader("Access-Control-Allow-Headers", "X-requested-with");
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {        
        response.setContentType("application/json; charset=UTF-8");
        response.setHeader("Cacth-Control", "no-store");
        
        var session = request.getSession();
        var key = "user";
        var user = (User)session.getAttribute(key);
        if (user != null) {
            user.increment();
        } else {
            user = new User();
            session.setAttribute(key, user);            
        }
        var json = user.toJson();
        var out = response.getWriter();
        out.print(json);
    }

}
