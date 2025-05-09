package webcise;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;

import jakarta.json.Json;
import jakarta.json.JsonException;
import jakarta.json.stream.JsonGenerator;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Part;

/**
 * <em>location="."</em>と指定することによりアップロードされたファイルが
 * Tomcatのworkディレクトリ以下に保存される。
 */
@WebServlet(name = "Upload", urlPatterns = {"/Upload"})
@MultipartConfig(fileSizeThreshold = 5000000,
        maxFileSize = 10000000,
        maxRequestSize = 10000000,
        location = ".")
public class Upload extends HttpServlet {

    private static final Pattern SEMICOLON_PATTERN = Pattern.compile(";");
    private static final Pattern EQ_PATTERN = Pattern.compile("=");

    // CORSにおけるUploadリクエスト対応
    // Webサーバ側でAccess-Control-Allow-Originを設定しているのでこのメソッド定義が無くても
    // プリフライトリクエストは成功する。ただVaryを設定したいので定義を残している。
    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Access-Control-Allow-OriginとAccess-Control-Allow-Credentialsは
        // Webサーバで設定している。設定値が固定であればWebサーバで設定する方が簡潔である。
        // 参考: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
        response.setHeader("Vary", "Origin");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");

        Part part = request.getPart("samplefile");
        String fileName = request.getParameter("filename");
        if (fileName == null || fileName.isEmpty()) {
            fileName = getFilename(part);
        }
        /**
         * ファイル名にマルチバイト文字が含まれる時にエンコードしないと
         * 書き出されるファイルのファイル名が文字化けする。
         */
        fileName = encodeFileName(fileName);

        // アプリケーションサーバがHTTP/2.0に対応できていたとしても
        // Webサーバからプロキシしてリクエストされた場合HTTP/1.0になってしまう。
        System.out.println("Protocol: " + request.getProtocol());
        //HttpUtil.dumpRequestHeader(request);
        //HttpUtil.dumpResponseHeader(response);

        if (!fileName.isEmpty()) {
            part.write(fileName);
            String msg = "アップロード成功";
            try (JsonGenerator generator = Json.createGeneratorFactory(null)
                    .createGenerator(response.getWriter())) {
                generator.writeStartObject();
                generator.write("status", HttpServletResponse.SC_OK);
                generator.write("message", msg);
                generator.writeEnd();
            } catch (JsonException exception) {
                exception.printStackTrace(System.err);
                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                        exception.getMessage());
            }
        } else {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST,
                    "ファイル名が見つかりません！");
        }
    }

    private String getFilename(Part part) {
        /*
		 * Content-Disposition: form-data; name="content"; filename="FILE_NAME"
         */
        String pairs[] = SEMICOLON_PATTERN.split(part.getHeader("Content-Disposition"));

        for (String pair : pairs) {
            if (pair.trim().startsWith("filename")) {
                String[] keyValue = EQ_PATTERN.split(pair);
                String fileName = keyValue[1].replace("\"", "");
                return fileName;
            }
        }

        return "";
    }

    private String encodeFileName(String fileName)
            throws ServletException, IOException {
        /**
         * POSTリクエスト内のパラメータをISO_8859_1でバイト列に変換する。
         * Tomcat8.5でもこの時の文字エンコーディングはISO_8859_1を使う
         * 必要がある。GETリクエストのパラメータを処理する際はUTF-8を使う。
         * http://tomcat.apache.org/migration-8.html#URIEncoding
         */
        String serverEncoding = StandardCharsets.ISO_8859_1.name();
        byte[] fileNameBytes = fileName.getBytes(serverEncoding);
        /**
         * HttpServletRequestの文字エンコーディングはnullになっている。
         * FormDataのパラメータはUTF-8で送られてくるものと見なしている。
         */
        //String requestEncoding = request.getCharacterEncoding();
        String requestEncoding = StandardCharsets.UTF_8.name();
        return new String(fileNameBytes, requestEncoding);
    }
}
