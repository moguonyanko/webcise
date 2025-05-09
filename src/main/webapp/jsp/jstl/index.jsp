<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %> 
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
    "http://www.w3.org/TR/html4/loose.dtd">
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="shortcut icon" href="../../favicon.ico" />
    <title>JSTL</title>
  </head>
  <body>
  <header>
    <a href="../../">home</a>
    <h1>JSTL</h1>
  </header>
  <main>
    <section>
      <h2>c:out</h2>
      <c:out value="${'Output text by JSTL'}"/>  
    </section>
    <section>
      <h2>c:set &amp; c:if</h2>
      <c:set var="testValue" scope="request" value="${param.testvalue}"/>  
      <c:if test="${testValue >= 0}">  
          <p>Test value = <c:out value="${testValue}"/><p>  
          </c:if>        
    </section>
    <section>
      <h2>c:forEach</h2>
      <c:forEach items="<%=new int[]{1,2,3,4,5}%>" var="n" varStatus="status">  
          Number <span>Index = ${status.index}</span>,Value = <c:out value="${n}"/><p>  
      </c:forEach>  
    </section>
  </main>
</body>
</html>
