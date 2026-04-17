#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#define N 300
#define TRIALS 10000

// helper
double run_experiment(double p) {
    int bob_wins = 0;

    for (int t = 0; t < TRIALS; t++) {
        int bob_heads = 0;
        int alice_heads = 0;

        // Bob flips n+1 coins
        for (int i = 0; i < N + 1; i++) {
            double r = (double)rand() / RAND_MAX;   // random number between 0-1
            if (r < p) bob_heads++;
        }

        // Alice flips n coins
        for (int i = 0; i < N; i++) {
            double r = (double)rand() / RAND_MAX;
            if (r < p) alice_heads++;
        }

        if (bob_heads > alice_heads) {
            bob_wins++;
        }
    }

    return (double)bob_wins / TRIALS;   // relative frequency
}

int main() {
    // generates random number
    srand(time(NULL));

    double p_values[] = {0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8};
    int num_p = 7;

    printf("--------------------------\n");
    printf(" p      relative frequency\n");
    printf("--------------------------\n");

    for (int i = 0; i < num_p; i++) {
        double p = p_values[i];
        double relFreq = run_experiment(p);
        printf(" %.1f    %.4f\n", p, relFreq);
    }

    return 0;
}

/*
Conjuncture: Based on the results, the relative frequency of Bob winning still seems to be around
0.5, even with the different p values. This indicates that Bob will always have around a 0.5
of getting more heads than Alice, regardless of the p value. Therefore, I conjuncture that Bob
will always has a 50% chance of winning, since the p values do not affect his chances.
*/