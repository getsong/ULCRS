package ulcrs.models;

import org.junit.Before;
import org.junit.Test;
import ulcrs.models.course.Course;
import ulcrs.models.course.CourseIntensity;
import ulcrs.models.course.CourseRequirements;
import ulcrs.models.rank.Rank;
import ulcrs.models.shift.Shift;
import ulcrs.models.tutor.Tutor;
import ulcrs.models.tutor.TutorPreferences;
import ulcrs.models.tutor.TutorStatus;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.time.OffsetTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.Is.is;

public class TutorTest {

    List<Shift> shifts = new ArrayList<Shift>();
    List<Course> courses = new ArrayList<Course>();

    @Before
    public void setup() {
        // Create shifts
        Shift shift0 = new Shift(0, DayOfWeek.MONDAY, OffsetTime.of(LocalTime.of(16, 45), ZoneOffset.UTC), OffsetTime.of(LocalTime.of(19, 45), ZoneOffset.UTC));
        Shift shift1 = new Shift(1, DayOfWeek.TUESDAY, OffsetTime.of(LocalTime.of(18, 0), ZoneOffset.UTC), OffsetTime.of(LocalTime.of(21, 0), ZoneOffset.UTC));
        Shift shift2 = new Shift(2, DayOfWeek.WEDNESDAY, OffsetTime.of(LocalTime.of(19, 0), ZoneOffset.UTC), OffsetTime.of(LocalTime.of(21, 0), ZoneOffset.UTC));
        Shift shift3 = new Shift(3, DayOfWeek.THURSDAY, OffsetTime.of(LocalTime.of(18, 30), ZoneOffset.UTC), OffsetTime.of(LocalTime.of(21, 30), ZoneOffset.UTC));
        Shift shift4 = new Shift(4, DayOfWeek.FRIDAY, OffsetTime.of(LocalTime.of(17, 15), ZoneOffset.UTC), OffsetTime.of(LocalTime.of(20, 45), ZoneOffset.UTC));
        this.shifts.add(shift0);
        this.shifts.add(shift1);
        this.shifts.add(shift2);
        this.shifts.add(shift3);
        this.shifts.add(shift4);

        // Required shifts for courses
        Set shiftSet0 = new HashSet<Shift>();
        shiftSet0.add(shift0);
        Set shiftSet1 = new HashSet<Shift>();
        shiftSet1.add(shift1);
        shiftSet1.add(shift4);
        Set shiftSet2 = new HashSet<Shift>();
        shiftSet2.add(shift1);
        shiftSet2.add(shift2);
        shiftSet2.add(shift3);
        Set shiftSet3 = new HashSet<Shift>();
        shiftSet3.add(shift0);
        shiftSet3.add(shift2);
        shiftSet3.add(shift3);
        shiftSet3.add(shift4);

        // Create courses
        Course course0 = new Course(0, "CS 301", new CourseRequirements(shiftSet1, 1, 3, CourseIntensity.MEDIUM));
        Course course1 = new Course(1, "CS 302", new CourseRequirements(shiftSet2, 2, 2, CourseIntensity.HIGH));
        Course course2 = new Course(2, "CS 577", new CourseRequirements(shiftSet0, 1, 2, CourseIntensity.LOW));
        Course course3 = new Course(3, "EMA 201", new CourseRequirements(shiftSet3, 4, 4, CourseIntensity.HIGH));
        Course course4 = new Course(4, "ECE 210", new CourseRequirements(shiftSet0, 1, 1, CourseIntensity.LOW));
        this.courses.add(course0);
        this.courses.add(course1);
        this.courses.add(course2);
        this.courses.add(course3);
        this.courses.add(course4);
    }

    @Test
    public void testConstructor_tutor_returnsFieldsCorrectly() {
        // Shift preference
        Set preferredShifts = new HashSet<Shift>();
        preferredShifts.add(shifts.get(0));         // Monday
        preferredShifts.add(shifts.get(2));         // Wednesday
        Set willingShifts = new HashSet<Shift>();
        willingShifts.add(shifts.get(3));           // Thursday

        Map<Rank, Set<Shift>> shiftPreference = new HashMap<>();
        shiftPreference.put(Rank.PREFER, preferredShifts);
        shiftPreference.put(Rank.WILLING, willingShifts);

        // Course preference
        Set preferredCourses = new HashSet<Course>();
        preferredCourses.add(courses.get(0));       // CS 302
        preferredCourses.add(courses.get(1));       // CS 301
        Set willingCourses = new HashSet<Course>();
        willingCourses.add(courses.get(2));         // CS 577

        Map coursePreferences = new HashMap<Rank, Set<Course>>();
        coursePreferences.put(Rank.PREFER, preferredCourses);
        coursePreferences.put(Rank.WILLING, willingCourses);

        // Shift frequency preference
        Map shiftFrequencyPreferences = new HashMap<Rank, Integer>();
        shiftFrequencyPreferences.put(Rank.PREFER, 2);
        shiftFrequencyPreferences.put(Rank.WILLING, 4);

        int id = 0;
        String firstName = "First";
        String lastName = "Last";
        TutorPreferences tutorPreferences = new TutorPreferences(coursePreferences, shiftPreference, shiftFrequencyPreferences);

        Tutor tutor0 = new Tutor(id, firstName, lastName, tutorPreferences, TutorStatus.ACTIVE);

        assertThat(tutor0.getId(), is(0));
        assertThat(tutor0.getFirstName(), is(firstName));
        assertThat(tutor0.getLastName(), is(lastName));
        assertThat(tutor0.getTutorPreferences(), is(new TutorPreferences(coursePreferences, shiftPreference, shiftFrequencyPreferences)));
        assertThat(tutor0.getTutorStatus(), is(TutorStatus.ACTIVE));
    }

}
