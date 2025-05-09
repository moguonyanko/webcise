package webcise;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;
import java.nio.file.Paths;
import java.util.function.Supplier;

import jakarta.websocket.OnMessage;
import jakarta.websocket.OnOpen;
import jakarta.websocket.OnClose;
import jakarta.websocket.Session;
import jakarta.websocket.server.ServerEndpoint;

@ServerEndpoint("/myreader")
public class MyReader {

    private static class DelayReaderSupplier<T extends Reader>
            implements Supplier<T>, AutoCloseable {

        private final T reader;

        public DelayReaderSupplier(Supplier<T> supplier) {
            /**
             * @todo
             * ここでSupplier.getを呼び出したら遅延初期化にならないのでは？
             */
            this.reader = supplier.get();
        }

        @Override
        public T get() {
            return reader;
        }

        @Override
        public void close() {
            try (Reader r = reader) {
                /**
                 * Reader.closeを呼び出すためだけのtryブロックです。
                 */
            } catch (IOException ex) {
                String msg = "ファイルを閉じる時にエラーが発生しました。";
                System.err.println(msg + ex.getMessage());
            }
        }
    }

    /**
     * @todo
     * OnOpenで毎度初期化する必要があるためfinalにできない。
     */
    private DelayReaderSupplier<BufferedReader> supplier;
    private static final String FILE_PATH = "D:\\moglabo\\lang\\java\\webcise\\src\\webcise\\sample.txt";

    @OnOpen
    public void createReader(Session peer) {
        supplier = new DelayReaderSupplier(() -> {
            try {
                System.out.println("<" + FILE_PATH + ">を読むためのReaderを初期化します。");
                return new BufferedReader(new FileReader(Paths.get(FILE_PATH).toFile()));
            } catch (FileNotFoundException ex) {
                throw new IllegalStateException(ex.getMessage());
            }
        });
    }

    @OnMessage
    public String readFile(String message) {
        int lineSize = Integer.parseInt(message);

        StringBuilder result = new StringBuilder();

        try {
            BufferedReader reader = supplier.get();

            result.append("{\"result\":").append("\"");

            while (lineSize > 0) {
                String line = reader.readLine();

                if (line != null) {
                    result.append(line).append("\\n");
                } else {
                    result.append("EOF");
                    break;
                }

                --lineSize;
            }

            result.append("\"}");
        } catch (IOException ex) {
            result.append("{\"message\":").append(ex.getMessage()).append("}");
        }

        return result.toString();
    }

    @OnClose
    public void closeReader(Session peer) {
        try (DelayReaderSupplier<BufferedReader> s = supplier) {
            /**
             * DelayReaderSupplier.closeを呼び出すためだけのtryブロックです。
             */
            System.out.println("<" + FILE_PATH + ">を読むためのReaderをクローズします。");
        }
    }

}
