package webcise;

import java.io.IOException;
import java.io.PrintWriter;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet(name = "ModuleScript", urlPatterns = {"/ModuleScript"})
public class ModuleScript extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/javascript;charset=UTF-8");
        
        Cookie cookie = new Cookie("modulekey", "modulevalue");
        response.addCookie(cookie);

        try (PrintWriter out = response.getWriter()) {
            out.println("const helloModule = () => {");
            out.println("return 'Hello!'");
            out.println("};");
            out.println("export default helloModule;");
        }
    }

}
