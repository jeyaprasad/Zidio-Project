package com.zidio.nexushr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class NexushrApplication {

    public static void main(String[] args) {
        SpringApplication.run(NexushrApplication.class, args);
    }

}
