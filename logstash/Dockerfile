FROM docker.elastic.co/logstash/logstash:7.17.1
USER root
RUN mkdir /logstash
RUN chown -R root /logstash
RUN chmod -R 777 /logstash
COPY ./logstash.conf /logstash/logstash.conf
