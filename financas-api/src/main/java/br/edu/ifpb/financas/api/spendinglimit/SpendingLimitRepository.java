package br.edu.ifpb.financas.api.spendinglimit;

import br.edu.ifpb.financas.api.category.Category;
import br.edu.ifpb.financas.api.user.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SpendingLimitRepository extends JpaRepository<SpendingLimit, Long> {
    List<SpendingLimit> findAllByUser(AppUser user);
    Optional<SpendingLimit> findByUserAndCategory(AppUser user, Category category);
}
