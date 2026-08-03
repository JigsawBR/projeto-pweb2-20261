package br.edu.ifpb.financas.api.spendinglimit;

import br.edu.ifpb.financas.api.category.Category;
import br.edu.ifpb.financas.api.category.CategoryRepository;
import br.edu.ifpb.financas.api.user.AppUser;
import br.edu.ifpb.financas.api.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SpendingLimitService {

    private final SpendingLimitRepository spendingLimitRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public List<SpendingLimitResponse> listLimits(String username) {
        AppUser user = findUser(username);
        return spendingLimitRepository.findAllByUser(user).stream()
                .map(SpendingLimitResponse::from)
                .toList();
    }

    public SpendingLimitResponse createLimit(String username, CreateSpendingLimitRequest request) {
        AppUser user = findUser(username);
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new EntityNotFoundException("Categoria não encontrada"));

        spendingLimitRepository.findByUserAndCategory(user, category).ifPresent(existing -> {
            throw new IllegalArgumentException(
                    "Já existe um limite de gastos para a categoria " + category.getName());
        });

        SpendingLimit limit = SpendingLimit.builder()
                .limitAmount(request.limitAmount())
                .user(user)
                .category(category)
                .build();

        return SpendingLimitResponse.from(spendingLimitRepository.save(limit));
    }

    public void deleteLimit(String username, Long id) {
        SpendingLimit limit = spendingLimitRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Limite de gastos não encontrado"));
        if (!limit.getUser().getUsername().equals(username)) {
            throw new AccessDeniedException("Acesso negado");
        }
        spendingLimitRepository.delete(limit);
    }

    private AppUser findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));
    }
}
