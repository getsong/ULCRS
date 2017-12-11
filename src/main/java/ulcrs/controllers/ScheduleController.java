package ulcrs.controllers;

import spark.Request;
import spark.Response;
import spark.RouteGroup;
import ulcrs.models.schedule.Schedule;
import ulcrs.scheduler.SchedulerHelper;

import java.util.List;

import static spark.Spark.before;
import static spark.Spark.get;
import static spark.Spark.post;

public class ScheduleController extends BaseController {

    @Override
    public RouteGroup routes() {
        return () -> {
            before("/*", (request, response) -> log.info("endpoint: " + request.pathInfo()));
            get("/", this::fetchGeneratedSchedules, gson::toJson);
            post("/generate", this::generateSchedule, gson::toJson);
            post("/validate", this::validateSchedule, gson::toJson);
        };
    }

    private List<Schedule> fetchGeneratedSchedules(Request request, Response response) {
        response.type(CONTENT_TYPE_JSON);
        return SchedulerHelper.fetchGeneratedSchedules();
    }

    private boolean generateSchedule(Request request, Response response) {
        response.type(CONTENT_TYPE_JSON);

        int timeLimitInSecond = 10;
        String timeLimitInSecondParam = request.queryParams("timeLimitInSecond");
        if (timeLimitInSecondParam != null) {
            timeLimitInSecond = Integer.parseInt(timeLimitInSecondParam);
        }
        log.info("timeLimitInSecond: " + timeLimitInSecondParam);

        int solutionLimit = 50;
        String solutionLimitParam = request.queryParams("solutionLimit");
        if (solutionLimitParam != null) {
            solutionLimit = Integer.parseInt(solutionLimitParam);
        }
        log.info("solutionLimit: " + solutionLimitParam);

        return SchedulerHelper.generateSchedule(timeLimitInSecond, solutionLimit);
    }

    private boolean validateSchedule(Request request, Response response) {
        response.type(CONTENT_TYPE_JSON);

        // TODO implement
        Schedule schedule = gson.fromJson(request.body(), Schedule.class);
        return SchedulerHelper.verifySchedule(schedule);
    }
}
