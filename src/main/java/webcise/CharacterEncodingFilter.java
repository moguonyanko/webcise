package webcise;

import java.io.IOException;

import jakarta.servlet.DispatcherType;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.annotation.WebInitParam;

@WebFilter(filterName = "CharacterEncodingFilter", urlPatterns = {"/*"}, 
	dispatcherTypes = {DispatcherType.REQUEST, DispatcherType.FORWARD, 
		DispatcherType.ERROR, DispatcherType.INCLUDE}, 
	initParams = { @WebInitParam(name = "charset", value = "UTF-8") })
public class CharacterEncodingFilter implements Filter {

	private FilterConfig filterConfig = null;

	@Override
	public void doFilter(ServletRequest request, ServletResponse response,
		FilterChain chain) throws IOException, ServletException {
		String charset = filterConfig.getInitParameter("charset");
		response.setCharacterEncoding(charset);
		chain.doFilter(request, response);
	}

	@Override
	public void init(FilterConfig filterConfig) throws ServletException {
		this.filterConfig = filterConfig;
	}

	@Override
	public void destroy() {
		/* Does nothing. */
	}

}
