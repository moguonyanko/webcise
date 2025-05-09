package webcise;

import java.util.Collection;
import java.util.function.IntPredicate;
import java.util.function.UnaryOperator;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import jakarta.websocket.OnMessage;
import jakarta.websocket.server.ServerEndpoint;

@ServerEndpoint("/prime")
public class Prime {

	private static <T> Collection<T> collectPrimes(
		T seed, UnaryOperator<T> nextValueOperator, int limitSize) {
		Collection<T> result = Stream.iterate(seed, nextValueOperator)
			.limit(limitSize)
			.collect(Collectors.toList());

		return result;
	}

	private static boolean isPrime(int n) {
		if (n <= 1) {
			return false;
		} else {
			IntPredicate canDivided = div -> n % div == 0;
			return IntStream.rangeClosed(2, (int) Math.sqrt(n))
				.noneMatch(canDivided);
		}
	}

	private static int primeAfter(int n) {
		int nextNumber = n + 1;

		if (isPrime(nextNumber)) {
			return nextNumber;
		} else {
			return primeAfter(nextNumber);
		}
	}

	@OnMessage
	public String onMessage(String message) {
		StringBuilder json = new StringBuilder();
		json.append("{\"result\":");

		String[] params = message.split(",");

		int startNumber = Integer.parseInt(params[0]);
		if (startNumber < 1) {
			json.append("[]");
		} else {
			int limitSize = Integer.valueOf(params[1]);

			Collection<Integer> result = collectPrimes(primeAfter(startNumber - 1),
				Prime::primeAfter,
				limitSize);

			json.append(result);
		}

		json.append("}");

		return json.toString();
	}

}
