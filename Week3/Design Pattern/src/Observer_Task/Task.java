package Observer_Task;

public interface Task {
    void attach(TeamMember member);
    void detach(TeamMember member);
    void notifyMembers();
}
