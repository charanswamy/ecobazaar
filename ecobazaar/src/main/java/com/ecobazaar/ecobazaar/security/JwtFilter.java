package com.ecobazaar.ecobazaar.security;

import com.ecobazaar.ecobazaar.util.JwtUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtFilter.class);

    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String path = request.getServletPath();
        String method = request.getMethod();

        // 1️⃣ Public URLs (NO AUTH REQUIRED)
        if (path.startsWith("/api/auth/")
                || (method.equals("GET") && path.equals("/api/products"))
                || (method.equals("GET") && path.matches("^/api/products/\\d+$"))
        ) {
            chain.doFilter(request, response);
            return;
        }

        // 2️⃣ Check Authorization header
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);

        try {
            if (!jwtUtil.validateToken(token)) {
                chain.doFilter(request, response);
                return;
            }

            Claims claims = jwtUtil.getClaims(token);
            String email = claims.getSubject();

            Collection<SimpleGrantedAuthority> roles = extractRoles(claims);

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(email, null, roles);

            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (ExpiredJwtException e) {
            log.warn("Expired token");
        } catch (JwtException e) {
            log.warn("Invalid token");
        }

        chain.doFilter(request, response);
    }

    private Collection<SimpleGrantedAuthority> extractRoles(Claims claims) {
        List<SimpleGrantedAuthority> list = new ArrayList<>();

        Object rolesObj = claims.get("roles");
        if (rolesObj instanceof List<?> roles) {
            for (Object r : roles) {
                list.add(new SimpleGrantedAuthority(r.toString()));
            }
        }

        String singleRole = claims.get("role", String.class);
        if (singleRole != null) {
            list.add(new SimpleGrantedAuthority(singleRole));
        }

        return list;
    }
}
