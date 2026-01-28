package Observer_Task;

import java.util.ArrayList;
import java.util.List;

public class ConcreteTask implements Task {
    private String taskName;
    private TaskStatus status;
    private List<TeamMember> members = new ArrayList<>();

    public ConcreteTask(String taskName) {
        this.taskName = taskName;
        this.status = TaskStatus.TODO;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
        notifyMembers();
    }

    @Override
    public void attach(TeamMember member) {
        members.add(member);
    }

    @Override
    public void detach(TeamMember member) {
        members.remove(member);
    }

    @Override
    public void notifyMembers() {
        for (TeamMember member : members) {
            member.update(taskName, status);
        }
    }
}
