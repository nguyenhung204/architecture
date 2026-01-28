package Observer_Task;

public class Developer implements TeamMember{
    private String name;

    public Developer(String name) {
        this.name = name;
    }

    @Override
    public void update(String taskName, TaskStatus status) {
        System.out.println(
                name + " notified: Task '" + taskName + "' is now " + status
        );
    }
}
