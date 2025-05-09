package webcise;

import java.io.IOException;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet(name = "Encoding", urlPatterns = {"/Encoding"})
public class Encoding extends HttpServlet {
    
    private void execute(HttpServletRequest req, HttpServletResponse res) 
            throws IOException {
        var encoding = req.getCharacterEncoding();
        // charset付きでContent-Typeを明示的に設定しないと文字化けする。
        // setCharacterEncodingだけ行っても文字化けは防げない。
        res.setContentType("text/plain;charset=" + encoding);
        //res.setCharacterEncoding(encoding); // 不要
        var out = res.getWriter();
        var name = req.getParameter("name");
        out.print(name + "(request encoding=" + encoding + ")");        
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) 
            throws IOException {
        execute(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) 
            throws IOException {
        execute(req, resp);
    }

}
