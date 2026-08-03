package br.edu.ifpb.financas.api.goal;

import br.edu.ifpb.financas.api.category.Category;
import br.edu.ifpb.financas.api.category.CategoryRepository;
import br.edu.ifpb.financas.api.user.AppUser;
import br.edu.ifpb.financas.api.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class GoalService {

    private final GoalRepository goalRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public List<GoalResponse> listGoals(String username) {
        AppUser user = findUser(username);
        return goalRepository.findAllByUser(user).stream()
                .map(GoalResponse::from)
                .toList();
    }

    public GoalResponse createGoal(String username, CreateGoalRequest request) {
        AppUser user = findUser(username);
        Category category = resolveCategory(request.categoryId());

        Goal goal = Goal.builder()
                .name(request.name())
                .targetAmount(request.targetAmount())
                .startDate(request.startDate() != null ? request.startDate() : LocalDate.now())
                .deadline(request.deadline())
                .user(user)
                .category(category)
                .build();

        return GoalResponse.from(goalRepository.save(goal));
    }

    public GoalResponse updateGoal(String username, Long id, CreateGoalRequest request) {
        Goal goal = findGoalAndCheckOwnership(username, id);
        Category category = resolveCategory(request.categoryId());

        goal.setName(request.name());
        goal.setTargetAmount(request.targetAmount());
        goal.setStartDate(request.startDate() != null ? request.startDate() : goal.getStartDate());
        goal.setDeadline(request.deadline());
        goal.setCategory(category);

        return GoalResponse.from(goalRepository.save(goal));
    }

    public void deleteGoal(String username, Long id) {
        Goal goal = findGoalAndCheckOwnership(username, id);
        goalRepository.delete(goal);
    }

    private Goal findGoalAndCheckOwnership(String username, Long id) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Meta não encontrada"));
        if (!goal.getUser().getUsername().equals(username)) {
            throw new AccessDeniedException("Acesso negado");
        }
        return goal;
    }

    private Category resolveCategory(Long categoryId) {
        if (categoryId == null) return null;
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Categoria não encontrada"));
    }

    private AppUser findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));
    }
}
