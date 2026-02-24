// backend/src/test/java/com/autoloan/backend/AutoloanBackendApplicationTest.java
package com.autoloan.backend;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class AutoloanBackendApplicationTest {

    @Test
    void mainMethodStartsWithoutError() {
        assertDoesNotThrow(() -> AutoloanBackendApplication.main(new String[]{"--spring.main.web-application-type=none", "--spring.datasource.url=jdbc:postgresql://localhost:5432/autoloan_angular_springboot?socketFactory=org.newsclub.net.unix.AFUNIXSocketFactory$FactoryArg&socketFactoryArg=/var/run/postgresql/.s.PGSQL.5432", "--spring.datasource.username=lenovo", "--spring.jpa.hibernate.ddl-auto=none"}));
    }
}
