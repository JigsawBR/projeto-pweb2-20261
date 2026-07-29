package br.edu.ifpb.financas.api.goal;

import br.edu.ifpb.financas.api.user.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findAllByUser(AppUser user);
}
