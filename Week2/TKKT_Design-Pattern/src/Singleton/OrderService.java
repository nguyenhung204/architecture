package Singleton;

public class OrderService {

        private final LoggingSingleTon log = LoggingSingleTon.getInstance();


        public void placeOrder(String userId, int amount) {
            log.log("Place order: user=" + userId + ", amount=" + amount);
        }

}
