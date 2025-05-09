package webcise.util;

import java.util.Collections;
import java.util.List;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class HttpUtil {

    public static void dumpRequestHeader(HttpServletRequest request) {
        System.out.println("----- HTTP REQUEST HEADER START -----");
        Collections.list(request.getHeaderNames())
                .stream()
                .forEach(name -> {
                    List<String> values = Collections.list(request.getHeaders(name));
                    values.forEach(value -> System.out.println(name + ": " + value));
                });
        System.out.println("----- HTTP REQUEST HEADER END -----");
    }

    public static void dumpResponseHeader(HttpServletResponse response) {
        System.out.println("----- HTTP RESPONSE HEADER START -----");
        response.getHeaderNames()
                .stream()
                .forEach(name -> {
                    response.getHeaders(name)
                            .forEach(value -> System.out.println(name + ":" + value));
                });
        System.out.println("----- HTTP RESPONSE HEADER END -----");
    }

}
